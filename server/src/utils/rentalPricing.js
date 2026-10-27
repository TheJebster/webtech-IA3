import mongoose from 'mongoose';
import Equipment from '../models/Equipment.js';
import Rental, { RESERVING_STATUSES } from '../models/Rental.js';
import ApiError from './ApiError.js';

const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_RENTAL_DAYS = 30;

// "YYYY-MM-DD" -> Date at UTC midnight
export const parseDay = (value) => new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);

// Inclusive day count: a one-day event (start = end) is 1 day
export const countDays = (start, end) => Math.round((end - start) / DAY_MS) + 1;

// Units of each equipment already reserved by pending/approved rentals overlapping [start, end]
export async function reservedQuantities(equipmentIds, start, end, excludeRentalId) {
  const match = {
    status: { $in: RESERVING_STATUSES },
    startDate: { $lte: end },
    endDate: { $gte: start },
    'items.equipment': { $in: equipmentIds.map((id) => new mongoose.Types.ObjectId(String(id))) },
  };
  if (excludeRentalId) match._id = { $ne: new mongoose.Types.ObjectId(String(excludeRentalId)) };

  const rows = await Rental.aggregate([
    { $match: match },
    { $unwind: '$items' },
    { $group: { _id: '$items.equipment', reserved: { $sum: '$items.quantity' } } },
  ]);
  return new Map(rows.map((r) => [r._id.toString(), r.reserved]));
}

/**
 * Prices a set of items for a date range and checks stock.
 * Returns { days, lines: [{ equipment, name, dailyRate, quantity, subtotal, available, ok }], totalCost, ok }.
 */
export async function buildQuote({ items, startDate, endDate, excludeRentalId, includeInactive = false }) {
  const start = parseDay(startDate);
  const end = parseDay(endDate);
  const days = countDays(start, end);

  const ids = items.map((i) => String(i.equipment));
  const filter = { _id: { $in: ids } };
  if (!includeInactive) filter.isActive = true;
  const equipment = await Equipment.find(filter);
  const byId = new Map(equipment.map((e) => [e._id.toString(), e]));
  const reserved = await reservedQuantities(ids, start, end, excludeRentalId);

  const lines = items.map(({ equipment: id, quantity }) => {
    const eq = byId.get(String(id));
    if (!eq) {
      return { equipment: id, name: 'Unavailable item', quantity, available: 0, ok: false, missing: true, dailyRate: 0, subtotal: 0 };
    }
    const available = Math.max(0, eq.quantityTotal - (reserved.get(String(id)) || 0));
    const subtotal = eq.dailyRate * quantity * days;
    return {
      equipment: eq._id,
      name: eq.name,
      category: eq.category,
      imageUrl: eq.imageUrl,
      dailyRate: eq.dailyRate,
      quantity,
      subtotal,
      available,
      ok: quantity <= available,
    };
  });

  return {
    startDate: start,
    endDate: end,
    days,
    lines,
    totalCost: lines.reduce((sum, l) => sum + l.subtotal, 0),
    ok: lines.every((l) => l.ok),
  };
}

// Throws a 409 describing which items don't have enough stock
export function assertQuoteAvailable(quote) {
  if (quote.ok) return;
  const problems = quote.lines
    .filter((l) => !l.ok)
    .map((l) => (l.missing ? `an item is no longer available` : `${l.name}: only ${l.available} available`));
  throw new ApiError(409, `Not enough stock for those dates — ${problems.join('; ')}.`, { items: problems });
}
