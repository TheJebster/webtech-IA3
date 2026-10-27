import Equipment, { CATEGORIES, CONDITIONS } from '../models/Equipment.js';
import Rental, { RESERVING_STATUSES } from '../models/Rental.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../utils/logActivity.js';
import { parseDay, reservedQuantities } from '../utils/rentalPricing.js';

const SORTS = {
  newest: { createdAt: -1 },
  name: { name: 1 },
  price_asc: { dailyRate: 1 },
  price_desc: { dailyRate: -1 },
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Customers only ever see active equipment; admins can filter by status.
function visibilityFilter(user, status = 'all') {
  if (user?.role !== 'admin') return { isActive: true };
  if (status === 'active') return { isActive: true };
  if (status === 'inactive') return { isActive: false };
  return {};
}

// Units of each item rented in approved/returned rentals — powers "Most popular"
async function rentedUnits() {
  const rows = await Rental.aggregate([
    { $match: { status: { $in: ['approved', 'returned'] } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.equipment', units: { $sum: '$items.quantity' } } },
  ]);
  return new Map(rows.map((r) => [r._id.toString(), r.units]));
}

// Adds `available` (units free for the date range) to each item when ?start&end are given
async function withAvailability(items, start, end) {
  const plain = items.map((i) => i.toJSON());
  if (!start || !end || plain.length === 0) return plain;
  const reserved = await reservedQuantities(plain.map((i) => i._id), parseDay(start), parseDay(end));
  return plain.map((i) => ({ ...i, available: Math.max(0, i.quantityTotal - (reserved.get(String(i._id)) || 0)) }));
}

// GET /api/equipment?q=&category=&sort=&page=&limit=&status=&minRate=&maxRate=&start=&end=
export async function listEquipment(req, res) {
  const { q, category, sort = 'newest', status, start, end } = req.query;
  // Express 5's req.query is read-only, so validator sanitizers can't convert these in place
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const filter = visibilityFilter(req.user, status);
  if (category) filter.category = category;
  if (q?.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
  }
  if (req.query.minRate || req.query.maxRate) {
    filter.dailyRate = {};
    if (req.query.minRate) filter.dailyRate.$gte = Number(req.query.minRate);
    if (req.query.maxRate) filter.dailyRate.$lte = Number(req.query.maxRate);
  }

  let items;
  const total = await Equipment.countDocuments(filter);
  if (sort === 'popular') {
    // Small catalogue: rank in memory by units rented, then by name
    const [all, units] = await Promise.all([Equipment.find(filter), rentedUnits()]);
    all.sort((a, b) => (units.get(String(b._id)) || 0) - (units.get(String(a._id)) || 0) || a.name.localeCompare(b.name));
    items = all.slice((page - 1) * limit, page * limit);
  } else {
    items = await Equipment.find(filter).sort(SORTS[sort]).skip((page - 1) * limit).limit(limit);
  }

  res.json({
    items: await withAvailability(items, start, end),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
}

// GET /api/equipment/meta — categories (with counts) and conditions for filters/forms
export async function equipmentMeta(req, res) {
  const counts = await Equipment.aggregate([
    { $match: visibilityFilter(req.user) },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const byCategory = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  res.json({
    categories: CATEGORIES.map((name) => ({ name, count: byCategory[name] || 0 })),
    conditions: CONDITIONS,
  });
}

// GET /api/equipment/:id?start=&end=
export async function getEquipment(req, res) {
  const item = await Equipment.findOne({ _id: req.params.id, ...visibilityFilter(req.user) });
  if (!item) throw new ApiError(404, 'Equipment not found.');
  const [withAvail] = await withAvailability([item], req.query.start, req.query.end);
  res.json({ item: withAvail });
}

const EDITABLE = ['name', 'category', 'description', 'features', 'dailyRate', 'quantityTotal', 'condition', 'imageUrl', 'isActive'];
const pick = (src) => Object.fromEntries(EDITABLE.filter((k) => src[k] !== undefined).map((k) => [k, src[k]]));

// POST /api/equipment (admin)
export async function createEquipment(req, res) {
  const item = await Equipment.create({ ...pick(req.body), createdBy: req.user._id });
  await logActivity({ actor: req.user, action: 'equipment.create', entity: 'equipment', entityId: item._id, message: `added equipment "${item.name}"` });
  res.status(201).json({ item });
}

// PUT /api/equipment/:id (admin)
export async function updateEquipment(req, res) {
  const item = await Equipment.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Equipment not found.');

  item.set(pick(req.body));
  await item.save();
  await logActivity({ actor: req.user, action: 'equipment.update', entity: 'equipment', entityId: item._id, message: `updated equipment "${item.name}"` });
  res.json({ item });
}

// DELETE /api/equipment/:id (admin)
export async function deleteEquipment(req, res) {
  const item = await Equipment.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Equipment not found.');

  const active = await Rental.countDocuments({ 'items.equipment': item._id, status: { $in: RESERVING_STATUSES } });
  if (active > 0) {
    throw new ApiError(409, `"${item.name}" is part of ${active} pending/approved rental${active > 1 ? 's' : ''}. Hide it instead, or close those rentals first.`);
  }

  await item.deleteOne();
  await logActivity({ actor: req.user, action: 'equipment.delete', entity: 'equipment', entityId: item._id, message: `deleted equipment "${item.name}"` });
  res.json({ message: `"${item.name}" was deleted.` });
}
