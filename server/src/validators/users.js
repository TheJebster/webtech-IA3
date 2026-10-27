import { body, param, query } from 'express-validator';
import { ROLES } from '../models/User.js';
import { emailRule, nameRule, phoneRule, strongPassword } from './common.js';

export const userIdParam = [param('id').isMongoId().withMessage('Invalid id')];

export const listUsersRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  query('role').optional({ values: 'falsy' }).isIn(ROLES).withMessage('Unknown role'),
  query('status').optional({ values: 'falsy' }).isIn(['active', 'inactive']).withMessage('Unknown status'),
];

export const createUserRules = [
  nameRule(),
  emailRule(),
  phoneRule(),
  body('role').optional().isIn(ROLES).withMessage('Role must be admin or user'),
  strongPassword('password'),
];

export const updateUserRules = [
  ...userIdParam,
  nameRule(true),
  emailRule(true),
  phoneRule(),
  body('role').optional().isIn(ROLES).withMessage('Role must be admin or user'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false').toBoolean(),
  // Optional admin password reset
  strongPassword('password').optional({ values: 'falsy' }),
];
