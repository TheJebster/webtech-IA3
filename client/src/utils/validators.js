// Client-side validation mirroring the server rules (server re-validates everything).

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[+]?[\d\s-]{7,15}$/;

export const PASSWORD_CHECKS = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'A number', test: (p) => /\d/.test(p) },
  { id: 'symbol', label: 'A special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const passwordScore = (password = '') => PASSWORD_CHECKS.filter((c) => c.test(password)).length;
export const isStrongPassword = (password) => passwordScore(password) === PASSWORD_CHECKS.length;

export function validateName(name) {
  const v = name.trim();
  if (!v) return 'Name is required';
  if (v.length < 2 || v.length > 60) return 'Name must be 2–60 characters';
  return '';
}

export function validateEmail(email) {
  const v = email.trim();
  if (!v) return 'Email is required';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address';
  return '';
}

export function validatePhone(phone) {
  if (!phone.trim()) return '';
  return PHONE_RE.test(phone.trim()) ? '' : 'Enter a valid phone number';
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (!isStrongPassword(password)) return 'Password does not meet all the requirements below';
  return '';
}

export const hasErrors = (errors) => Object.values(errors).some(Boolean);
