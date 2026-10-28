import Equipment from '../models/Equipment.js';
import User from '../models/User.js';
import Rental, { RESERVING_STATUSES } from '../models/Rental.js';
import Activity from '../models/Activity.js';

const EARNING_STATUSES = ['approved', 'returned'];
const startOfTodayUTC = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// GET /api/dashboard/admin
export async function adminDashboard(req, res) {
  const today = startOfTodayUTC();

  const [equipmentAgg, userAgg, statusAgg, revenueAgg, upcoming, topEquipment, byCategory, recentActivity] = await Promise.all([
    Equipment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          units: { $sum: '$quantityTotal' },
        },
      },
    ]),
    User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
        },
      },
    ]),
    Rental.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Rental.aggregate([
      { $match: { status: { $in: EARNING_STATUSES } } },
      { $group: { _id: null, revenue: { $sum: '$totalCost' }, count: { $sum: 1 } } },
    ]),
    Rental.find({ status: { $in: RESERVING_STATUSES }, endDate: { $gte: today } })
      .sort({ startDate: 1 })
      .limit(5),
    Rental.aggregate([
      { $match: { status: { $in: EARNING_STATUSES } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.equipment',
          name: { $last: '$items.name' },
          category: { $last: '$items.category' },
          imageUrl: { $last: '$items.imageUrl' },
          units: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]),
    Equipment.aggregate([
      { $group: { _id: '$category', items: { $sum: 1 }, units: { $sum: '$quantityTotal' } } },
      { $sort: { units: -1 } },
    ]),
    Activity.find().sort({ createdAt: -1 }).limit(10),
  ]);

  // Last 6 calendar months (UTC) of revenue (approved + returned, by event start) and request volume
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
    months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleString('en', { month: 'short', timeZone: 'UTC' }) });
  }
  const since = new Date(`${months[0].key}-01T00:00:00Z`);
  const [revenueRows, requestRows, outToday] = await Promise.all([
    Rental.aggregate([
      { $match: { status: { $in: EARNING_STATUSES }, startDate: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$startDate' } }, revenue: { $sum: '$totalCost' }, rentals: { $sum: 1 } } },
    ]),
    Rental.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, requests: { $sum: 1 } } },
    ]),
    // Units physically out with customers today (approved rentals running today)
    Rental.aggregate([
      { $match: { status: 'approved', startDate: { $lte: today }, endDate: { $gte: today } } },
      { $unwind: '$items' },
      { $group: { _id: null, units: { $sum: '$items.quantity' } } },
    ]),
  ]);
  const revByMonth = new Map(revenueRows.map((r) => [r._id, r]));
  const reqByMonth = new Map(requestRows.map((r) => [r._id, r.requests]));
  const monthly = months.map((m) => ({
    month: m.label,
    revenue: revByMonth.get(m.key)?.revenue || 0,
    rentals: revByMonth.get(m.key)?.rentals || 0,
    requests: reqByMonth.get(m.key) || 0,
  }));
  const thisMonth = monthly[5].revenue;
  const lastMonth = monthly[4].revenue;

  const e = equipmentAgg[0] || { total: 0, active: 0, units: 0 };
  const u = userAgg[0] || { total: 0, admins: 0, active: 0 };
  const rentalsByStatus = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));

  res.json({
    equipment: { total: e.total, active: e.active, hidden: e.total - e.active, units: e.units },
    users: { total: u.total, admins: u.admins, customers: u.total - u.admins, active: u.active },
    rentals: {
      byStatus: rentalsByStatus,
      total: statusAgg.reduce((sum, s) => sum + s.count, 0),
      pending: rentalsByStatus.pending || 0,
    },
    revenue: {
      total: revenueAgg[0]?.revenue || 0,
      rentals: revenueAgg[0]?.count || 0,
      thisMonth,
      lastMonth,
      // % change vs last month; null when there is nothing to compare against
      change: lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null,
    },
    monthly,
    utilization: { unitsOut: outToday[0]?.units || 0, totalUnits: e.units },
    upcoming,
    topEquipment: topEquipment.map(({ _id, ...rest }) => ({ equipment: _id, ...rest })),
    byCategory: byCategory.map(({ _id, ...rest }) => ({ category: _id, ...rest })),
    recentActivity,
  });
}

// GET /api/dashboard/me — a customer's own summary
export async function myDashboard(req, res) {
  const today = startOfTodayUTC();
  const [statusAgg, spentAgg, next] = await Promise.all([
    Rental.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Rental.aggregate([
      { $match: { user: req.user._id, status: { $in: EARNING_STATUSES } } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } },
    ]),
    Rental.findOne({ user: req.user._id, status: 'approved', endDate: { $gte: today } }).sort({ startDate: 1 }),
  ]);

  const byStatus = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));
  res.json({
    byStatus,
    total: statusAgg.reduce((sum, s) => sum + s.count, 0),
    spent: spentAgg[0]?.total || 0,
    nextRental: next,
  });
}
