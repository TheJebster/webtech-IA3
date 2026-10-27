import User from '../models/User.js';
import Rental, { RESERVING_STATUSES } from '../models/Rental.js';
import ApiError from '../utils/ApiError.js';
import { logActivity } from '../utils/logActivity.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// There must always be at least one active admin who can log in
async function assertAnotherActiveAdmin(excludeId, action) {
  const others = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: excludeId } });
  if (others === 0) throw new ApiError(400, `Cannot ${action} the last active admin.`);
}

// GET /api/users?q=&role=&status=&page=&limit=
export async function listUsers(req, res) {
  const { q, role, status } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.isActive = status === 'active';
  if (q?.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }

  const [items, total, summary] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
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
  ]);

  const s = summary[0] || { total: 0, admins: 0, active: 0 };
  res.json({
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    summary: { total: s.total, admins: s.admins, users: s.total - s.admins, active: s.active, inactive: s.total - s.active },
  });
}

// GET /api/users/:id
export async function getUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ user });
}

// POST /api/users — admins can create users of any role
export async function createUser(req, res) {
  const { name, email, phone, password, role = 'user' } = req.body;
  if (await User.exists({ email })) {
    throw new ApiError(409, 'An account with this email already exists.', { email: 'An account with this email already exists.' });
  }

  const user = await User.create({ name, email, phone, password, role });
  await logActivity({ actor: req.user, action: 'user.create', entity: 'user', entityId: user._id, message: `created ${role} account for ${user.name}` });
  res.status(201).json({ user });
}

// PUT /api/users/:id — update details, role, status, or reset password
export async function updateUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  const { name, email, phone, role, isActive, password } = req.body;
  const isSelf = user._id.equals(req.user._id);

  if (isSelf && role && role !== user.role) throw new ApiError(400, 'You cannot change your own role.');
  if (isSelf && isActive === false) throw new ApiError(400, 'You cannot deactivate your own account.');

  const losingAdmin = user.role === 'admin' && user.isActive && ((role && role !== 'admin') || isActive === false);
  if (losingAdmin) await assertAnotherActiveAdmin(user._id, role && role !== 'admin' ? 'demote' : 'deactivate');

  if (email && email !== user.email && (await User.exists({ email, _id: { $ne: user._id } }))) {
    throw new ApiError(409, 'An account with this email already exists.', { email: 'An account with this email already exists.' });
  }

  const changes = [];
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined && role !== user.role) { changes.push(`role → ${role}`); user.role = role; }
  if (isActive !== undefined && isActive !== user.isActive) { changes.push(isActive ? 'activated' : 'deactivated'); user.isActive = isActive; }
  if (password) { changes.push('password reset'); user.password = password; }

  await user.save();
  await logActivity({
    actor: req.user,
    action: 'user.update',
    entity: 'user',
    entityId: user._id,
    message: `updated user ${user.name}${changes.length ? ` (${changes.join(', ')})` : ''}`,
  });
  res.json({ user });
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user._id.equals(req.user._id)) throw new ApiError(400, 'You cannot delete your own account.');
  if (user.role === 'admin' && user.isActive) await assertAnotherActiveAdmin(user._id, 'delete');

  const active = await Rental.countDocuments({ user: user._id, status: { $in: RESERVING_STATUSES } });
  if (active > 0) {
    throw new ApiError(409, `${user.name} has ${active} pending/approved rental${active > 1 ? 's' : ''}. Deactivate the account instead, or close those rentals first.`);
  }

  await user.deleteOne();
  await logActivity({ actor: req.user, action: 'user.delete', entity: 'user', entityId: user._id, message: `removed user ${user.name}` });
  res.json({ message: `${user.name} was removed.` });
}
