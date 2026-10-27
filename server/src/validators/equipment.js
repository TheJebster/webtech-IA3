import { body, param, query } from 'express-validator';
import { CATEGORIES, CONDITIONS } from '../models/Equipment.js';

export const idParam = [param('id').isMongoId().withMessage('Invalid id')];

const rules = (optional) => {
  const field = (name) => (optional ? body(name).optional() : body(name));
  return [
    field('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name is too long'),
    field('category').isIn(CATEGORIES).withMessage('Choose a valid category'),
    body('description').optional().isString().trim().isLength({ max: 1000 }).withMessage('Description is too long (max 1000)'),
    body('features').optional().isArray({ max: 12 }).withMessage('Up to 12 features'),
    body('features.*').optional().isString().trim().isLength({ max: 80 }),
    field('dailyRate').isFloat({ min: 1, max: 1000000 }).withMessage('Daily rate must be a positive number').toFloat(),
    field('quantityTotal').isInt({ min: 0, max: 10000 }).withMessage('Quantity must be a whole number ≥ 0').toInt(),
    body('condition').optional().isIn(CONDITIONS).withMessage('Choose a valid condition'),
    body('imageUrl')
      .optional({ values: 'falsy' })
      .trim()
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Image URL must start with http:// or https://'),
    body('isActive').optional().isBoolean().withMessage('isActive must be true or false').toBoolean(),
  ];
};

export const createEquipmentRules = rules(false);
export const updateEquipmentRules = [...idParam, ...rules(true)];

export const listEquipmentRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('category').optional({ values: 'falsy' }).isIn(CATEGORIES).withMessage('Unknown category'),
  query('sort').optional().isIn(['newest', 'name', 'price_asc', 'price_desc']),
  query('status').optional().isIn(['all', 'active', 'inactive']),
];
