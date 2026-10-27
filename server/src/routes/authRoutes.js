import { Router } from 'express';
import { signup, login, me, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { signupRules, loginRules, changePasswordRules } from '../validators/auth.js';

const router = Router();

router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, me);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

export default router;
