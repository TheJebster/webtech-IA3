import { body, param, query } from 'express-validator';
import { RENTAL_STATUSES } from '../models/Rental.js';
import { MAX_RENTAL_DAYS, countDays, parseDay } from '../utils/rentalPricing.js';

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export const rentalIdParam = [param('id').isMongoId().withMessage('Invalid id')];

const itemsRules = [
  body('items').isArray({ min: 1, max: 20 }).withMessage('Add between 1 and 20 items'),
  body('items.*.equipment').isMongoId().withMessage('Invalid equipment'),
  body('items.*.quantity').isInt({ min: 1, max: 1000 }).withMessage('Quantity must be at least 1').toInt(),
  body('items').custom((items) => {
    const ids = items.map((i) => String(i.equipment));
    if (new Set(ids).size !== ids.length) throw new Error('Each equipment item can only appear once');
    return true;
  }),
];

const dateRules = [
  body('startDate')
    .matches(DAY_RE).withMessage('Start date is required')
    .custom((value) => {
      // Allow "today" in any timezone: compare against yesterday in UTC
      const earliest = new Date();
      earliest.setUTCHours(0, 0, 0, 0);
      earliest.setUTCDate(earliest.getUTCDate() - 1);
      if (parseDay(value) < earliest) throw new Error('Start date cannot be in the past');
      return true;
    }),
  body('endDate')
    .matches(DAY_RE).withMessage('End date is required')
    .custom((value, { req }) => {
      if (!DAY_RE.test(req.body.startDate || '')) return true;
      const days = countDays(parseDay(req.body.startDate), parseDay(value));
      if (days < 1) throw new Error('End date must be on or after the start date');
      if (days > MAX_RENTAL_DAYS) throw new Error(`Rentals can be at most ${MAX_RENTAL_DAYS} days`);
      return true;
    }),
];

export const quoteRules = [...itemsRules, ...dateRules];

export const createRentalRules = [
  ...itemsRules,
  ...dateRules,
  body('eventName').trim().notEmpty().withMessage('Event name is required').isLength({ max: 100 }).withMessage('Event name is too long'),
  body('venue').trim().notEmpty().withMessage('Venue is required').isLength({ max: 200 }).withMessage('Venue is too long'),
  body('notes').optional().isString().trim().isLength({ max: 500 }).withMessage('Notes are too long (max 500)'),
];

export const listRentalsRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('status').optional({ values: 'falsy' }).isIn(RENTAL_STATUSES).withMessage('Unknown status'),
];

export const updateStatusRules = [
  ...rentalIdParam,
  body('status').isIn(['approved', 'rejected', 'returned', 'cancelled']).withMessage('Invalid status'),
  body('adminNote').optional().isString().trim().isLength({ max: 300 }).withMessage('Note is too long (max 300)'),
];
