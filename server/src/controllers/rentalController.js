import Rental from '../models/Rental.js';
import ApiError from '../utils/ApiError.js';
import { fuzzyFilter } from '../utils/fuzzy.js';
import { logActivity } from '../utils/logActivity.js';
import { assertQuoteAvailable, buildQuote } from '../utils/rentalPricing.js';

// Allowed admin status changes
const TRANSITIONS = {
  pending: ['approved', 'rejected'],
  approved: ['returned', 'cancelled'],
};

// POST /api/rentals/quote — live price + availability preview (no booking made)
export async function quote(req, res) {
  const result = await buildQuote(req.body);
  res.json(result);
}

// POST /api/rentals — customer submits a rental request
export async function createRental(req, res) {
  const { items, startDate, endDate, eventName, venue, notes = '' } = req.body;
  const q = await buildQuote({ items, startDate, endDate });
  assertQuoteAvailable(q);

  const rental = await Rental.create({
    user: req.user._id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    eventName,
    venue,
    notes,
    startDate: q.startDate,
    endDate: q.endDate,
    days: q.days,
    items: q.lines.map(({ equipment, name, category, imageUrl, dailyRate, quantity, subtotal }) => ({
      equipment, name, category, imageUrl, dailyRate, quantity, subtotal,
    })),
    totalCost: q.totalCost,
  });

  await logActivity({ actor: req.user, action: 'rental.create', entity: 'rental', entityId: rental._id, message: `requested rental ${rental.code} for "${eventName}"` });
  res.status(201).json({ rental });
}

// GET /api/rentals/mine?status=
export async function myRentals(req, res) {
  const filter = { user: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const rentals = await Rental.find(filter).sort({ createdAt: -1 });
  res.json({ items: rentals });
}

// GET /api/rentals/:id — owner or admin
export async function getRental(req, res) {
  const rental = await Rental.findById(req.params.id);
  if (!rental || (req.user.role !== 'admin' && !rental.user.equals(req.user._id))) {
    throw new ApiError(404, 'Rental not found.');
  }
  res.json({ rental });
}

// PATCH /api/rentals/:id/cancel — owner cancels their own pending request
export async function cancelRental(req, res) {
  const rental = await Rental.findOne({ _id: req.params.id, user: req.user._id });
  if (!rental) throw new ApiError(404, 'Rental not found.');
  if (rental.status !== 'pending') throw new ApiError(400, 'Only pending requests can be cancelled. Contact us to change an approved booking.');

  rental.status = 'cancelled';
  await rental.save();
  await logActivity({ actor: req.user, action: 'rental.cancel', entity: 'rental', entityId: rental._id, message: `cancelled rental ${rental.code}` });
  res.json({ rental });
}

// GET /api/rentals?status=&q=&page=&limit= — admin
export async function listRentals(req, res) {
  const { status, q } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const filter = {};
  if (status) filter.status = status;

  const [found, counts] = await Promise.all([
    Rental.find(filter).sort({ createdAt: -1 }),
    Rental.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const matches = q?.trim()
    ? fuzzyFilter(found, q, (r) => [r.eventName, r.venue, r.customerName, r.customerEmail, ...r.items.map((i) => i.name)])
    : found;
  const total = matches.length;
  const items = matches.slice((page - 1) * limit, page * limit);

  res.json({
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
  });
}

// PATCH /api/rentals/:id/status — admin approves / rejects / closes a rental
export async function updateRentalStatus(req, res) {
  const { status, adminNote } = req.body;
  const rental = await Rental.findById(req.params.id);
  if (!rental) throw new ApiError(404, 'Rental not found.');

  const allowed = TRANSITIONS[rental.status] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `A ${rental.status} rental cannot be marked as ${status}.`);
  }

  // Re-check stock on approval in case inventory changed since the request
  if (status === 'approved') {
    const q = await buildQuote({
      items: rental.items.map((i) => ({ equipment: i.equipment, quantity: i.quantity })),
      startDate: rental.startDate.toISOString(),
      endDate: rental.endDate.toISOString(),
      excludeRentalId: rental._id,
      includeInactive: true,
    });
    assertQuoteAvailable(q);
  }

  rental.status = status;
  if (adminNote !== undefined) rental.adminNote = adminNote;
  rental.decidedBy = req.user._id;
  rental.decidedAt = new Date();
  await rental.save();

  await logActivity({ actor: req.user, action: `rental.${status}`, entity: 'rental', entityId: rental._id, message: `marked rental ${rental.code} as ${status}` });
  res.json({ rental });
}

// DELETE /api/rentals/:id — admin
export async function deleteRental(req, res) {
  const rental = await Rental.findById(req.params.id);
  if (!rental) throw new ApiError(404, 'Rental not found.');

  await rental.deleteOne();
  await logActivity({ actor: req.user, action: 'rental.delete', entity: 'rental', entityId: rental._id, message: `deleted rental ${rental.code}` });
  res.json({ message: `Rental ${rental.code} was deleted.` });
}
