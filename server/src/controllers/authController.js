import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';
import { logActivity } from '../utils/logActivity.js';

const authResponse = (user) => ({ token: signToken(user), user });

// POST /api/auth/signup — public sign-up always creates a normal user
export async function signup(req, res) {
  const { name, email, phone, password } = req.body;

  if (await User.exists({ email })) {
    throw new ApiError(409, 'An account with this email already exists.', {
      email: 'An account with this email already exists.',
    });
  }

  const user = await User.create({ name, email, phone, password, role: 'user' });
  await logActivity({ actor: user, action: 'user.signup', entity: 'user', entityId: user._id, message: `${user.name} signed up` });

  res.status(201).json(authResponse(user));
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact an administrator.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json(authResponse(user));
}

// GET /api/auth/me
export async function me(req, res) {
  res.json({ user: req.user });
}

// PUT /api/auth/change-password
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect.', {
      currentPassword: 'Current password is incorrect.',
    });
  }

  user.password = newPassword;
  await user.save();
  await logActivity({ actor: user, action: 'user.password', entity: 'user', entityId: user._id, message: `${user.name} changed their password` });

  res.json({ message: 'Password updated successfully.' });
}
