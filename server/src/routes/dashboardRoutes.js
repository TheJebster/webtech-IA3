import { Router } from 'express';
import { adminDashboard, myDashboard } from '../controllers/dashboardController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/admin', requireRole('admin'), adminDashboard);
router.get('/me', myDashboard);

export default router;
