import { Router } from 'express';
import {
  quote, createRental, myRentals, getRental, cancelRental, listRentals, updateRentalStatus, deleteRental,
} from '../controllers/rentalController.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  quoteRules, createRentalRules, listRentalsRules, updateStatusRules, rentalIdParam,
} from '../validators/rentals.js';

const router = Router();
router.use(protect);

// Customers
router.post('/quote', quoteRules, validate, quote);
router.post('/', requireRole('user'), createRentalRules, validate, createRental);
router.get('/mine', listRentalsRules, validate, myRentals);
router.patch('/:id/cancel', requireRole('user'), rentalIdParam, validate, cancelRental);

// Admins
router.get('/', requireRole('admin'), listRentalsRules, validate, listRentals);
router.patch('/:id/status', requireRole('admin'), updateStatusRules, validate, updateRentalStatus);
router.delete('/:id', requireRole('admin'), rentalIdParam, validate, deleteRental);

// Owner or admin
router.get('/:id', rentalIdParam, validate, getRental);

export default router;
