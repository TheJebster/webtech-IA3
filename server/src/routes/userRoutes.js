import { Router } from 'express';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { listUsersRules, createUserRules, updateUserRules, userIdParam } from '../validators/users.js';

const router = Router();

// User management is admin-only
router.use(protect, requireRole('admin'));

router.get('/', listUsersRules, validate, listUsers);
router.get('/:id', userIdParam, validate, getUser);
router.post('/', createUserRules, validate, createUser);
router.put('/:id', updateUserRules, validate, updateUser);
router.delete('/:id', userIdParam, validate, deleteUser);

export default router;
