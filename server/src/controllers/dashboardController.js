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
          units: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
    Equipment.aggregate([
      { $group: { _id: '$category', items: { $sum: 1 }, units: { $sum: '$quantityTotal' } } },
      { $sort: { units: -1 } },
    ]),
    Activity.find().sort({ createdAt: -1 }).limit(8),
  ]);

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
    revenue: { total: revenueAgg[0]?.revenue || 0, rentals: revenueAgg[0]?.count || 0 },
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
