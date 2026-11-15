// Small, reusable validators. Each returns an error message or '' when valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const required = (label) => (v) =>
  (Array.isArray(v) ? v.length === 0 : String(v ?? '').trim() === '') ? `${label} is required.` : '';

export const email = (v) => (v && !EMAIL_RE.test(v) ? 'Enter a valid email address, e.g. name@university.edu.' : '');

export const minLength = (n, label) => (v) =>
  v && String(v).trim().length < n ? `${label} must be at least ${n} characters.` : '';

export const maxLength = (n, label) => (v) =>
  v && String(v).length > n ? `${label} must be ${n} characters or fewer.` : '';

export const password = (v) => {
  if (!v) return '';
  if (v.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Password must include at least one letter and one number.';
  return '';
};

export const numberRange = (min, max, label) => (v) => {
  if (v === '' || v === null || v === undefined) return '';
  const n = Number(v);
  if (Number.isNaN(n)) return `${label} must be a number.`;
  if (n < min || n > max) return `${label} must be between ${min} and ${max}.`;
  return '';
};

export const futureDate = (v) => {
  if (!v) return '';
  return new Date(`${v}T00:00:00`) < new Date(new Date().toDateString()) ? 'Deadline must be today or later.' : '';
};

/** Run a map of { field: [validators] } against values. */
export function validate(values, rules) {
  const errors = {};
  Object.entries(rules).forEach(([field, fns]) => {
    for (const fn of fns) {
      const msg = fn(values[field], values);
      if (msg) {
        errors[field] = msg;
        break;
      }
    }
  });
  return errors;
}
