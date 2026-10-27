import Equipment, { CATEGORIES, CONDITIONS } from '../models/Equipment.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../utils/logActivity.js';

const SORTS = {
  newest: { createdAt: -1 },
  name: { name: 1 },
  price_asc: { dailyRate: 1 },
  price_desc: { dailyRate: -1 },
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Customers only ever see active equipment; admins can filter by status.
function visibilityFilter(user, status = 'all') {
  if (user.role !== 'admin') return { isActive: true };
  if (status === 'active') return { isActive: true };
  if (status === 'inactive') return { isActive: false };
  return {};
}

// GET /api/equipment?q=&category=&sort=&page=&limit=&status=
export async function listEquipment(req, res) {
  const { q, category, sort = 'newest', status } = req.query;
  // Express 5's req.query is read-only, so validator sanitizers can't convert these in place
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const filter = visibilityFilter(req.user, status);
  if (category) filter.category = category;
  if (q?.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
  }

  const [items, total] = await Promise.all([
    Equipment.find(filter).sort(SORTS[sort]).skip((page - 1) * limit).limit(limit),
    Equipment.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
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

// GET /api/equipment/:id
export async function getEquipment(req, res) {
  const item = await Equipment.findOne({ _id: req.params.id, ...visibilityFilter(req.user) });
  if (!item) throw new ApiError(404, 'Equipment not found.');
  res.json({ item });
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

  await item.deleteOne();
  await logActivity({ actor: req.user, action: 'equipment.delete', entity: 'equipment', entityId: item._id, message: `deleted equipment "${item.name}"` });
  res.json({ message: `"${item.name}" was deleted.` });
}
