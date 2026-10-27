import { body } from 'express-validator';

export const PASSWORD_RULES =
  'Password must be at least 8 characters and include uppercase, lowercase, a number and a special character.';

export const strongPassword = (field = 'password') =>
  body(field)
    .isString()
    .withMessage('Password is required')
    .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    .withMessage(PASSWORD_RULES);

export const nameRule = (optional = false) => {
  const chain = body('name');
  return (optional ? chain.optional() : chain)
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be 2–60 characters');
};

export const emailRule = (optional = false) => {
  const chain = body('email');
  return (optional ? chain.optional() : chain)
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail({ gmail_remove_dots: false });
};

export const phoneRule = () =>
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[+]?[\d\s-]{7,15}$/)
    .withMessage('Enter a valid phone number');
