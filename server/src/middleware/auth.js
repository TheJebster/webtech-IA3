import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';

// Requires a valid "Authorization: Bearer <token>" header and an active user.
export async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Not authenticated. Please log in.');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Session expired or invalid. Please log in again.');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'User no longer exists.');
  if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated.');

  req.user = user;
  next();
}

// For public routes that behave differently for signed-in users (e.g. admins see hidden items).
// A missing or invalid token simply means "guest" — it never blocks the request.
export async function optionalAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const user = await User.findById(verifyToken(token).id);
      if (user?.isActive) req.user = user;
    } catch {
      // ignore bad tokens on public routes
    }
  }
  next();
}

// Role-based access control: requireRole('admin')
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }
    next();
  };
}
