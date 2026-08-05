import {
  MAX_FIELD_VALUE_LENGTH,
  MAX_SUBMISSION_FIELDS,
  MAX_TEXTAREA_LENGTH,
} from '../constants/index.js';

export { MAX_SUBMISSION_FIELDS } from '../constants/index.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;

export interface SubmissionValidationError {
  path: string;
  message: string;
}

export interface SubmissionValidationResult {
  valid: boolean;
  errors: SubmissionValidationError[];
}

export function validateSubmissionPayload(
  fields: Record<string, unknown>,
  schemaFields: Array<{
    id: string;
    type: string;
    label: string;
    required?: boolean;
    options?: string[];
  }>,
): SubmissionValidationResult {
  const errors: SubmissionValidationError[] = [];
  const allowedFieldIds = new Set(schemaFields.map((field) => field.id));

  for (const key of Object.keys(fields)) {
    if (!allowedFieldIds.has(key)) {
      errors.push({ path: key, message: 'Unknown field' });
    }
  }

  if (Object.keys(fields).length > MAX_SUBMISSION_FIELDS) {
    errors.push({ path: 'fields', message: `Maximum ${String(MAX_SUBMISSION_FIELDS)} fields allowed` });
  }

  for (const field of schemaFields) {
    const value = fields[field.id];
    const hasValue = value !== undefined && value !== null && value !== '';

    if (field.required && !hasValue) {
      errors.push({ path: field.id, message: `${field.label} is required` });
      continue;
    }

    if (!hasValue) {
      continue;
    }

    validateFieldValue(field, value, errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateFieldValue(
  field: { id: string; type: string; label: string; options?: string[] },
  value: unknown,
  errors: SubmissionValidationError[],
): void {
  switch (field.type) {
    case 'email':
      if (typeof value !== 'string' || !EMAIL_PATTERN.test(value)) {
        errors.push({ path: field.id, message: 'Invalid email format' });
      }
      break;
    case 'phone':
      if (typeof value !== 'string' || !PHONE_PATTERN.test(value)) {
        errors.push({ path: field.id, message: 'Invalid phone format' });
      }
      break;
    case 'number':
      if (typeof value !== 'number' && (typeof value !== 'string' || Number.isNaN(Number(value)))) {
        errors.push({ path: field.id, message: 'Must be a valid number' });
      }
      break;
    case 'textarea':
      if (typeof value !== 'string') {
        errors.push({ path: field.id, message: 'Must be a string' });
      } else if (value.length > MAX_TEXTAREA_LENGTH) {
        errors.push({
          path: field.id,
          message: `Must be at most ${String(MAX_TEXTAREA_LENGTH)} characters`,
        });
      }
      break;
    case 'select':
    case 'radio':
      if (typeof value !== 'string' || !field.options?.includes(value)) {
        errors.push({ path: field.id, message: 'Invalid option selected' });
      }
      break;
    case 'checkbox':
      if (typeof value !== 'boolean' && typeof value !== 'string') {
        errors.push({ path: field.id, message: 'Invalid checkbox value' });
      }
      break;
    case 'date':
      if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
        errors.push({ path: field.id, message: 'Invalid date value' });
      }
      break;
    case 'url':
      try {
        if (typeof value !== 'string') {
          throw new Error('invalid');
        }
        new URL(value);
      } catch {
        errors.push({ path: field.id, message: 'Invalid URL format' });
      }
      break;
    case 'hidden':
    case 'text':
      if (typeof value !== 'string') {
        errors.push({ path: field.id, message: 'Must be a string' });
      } else if (value.length > MAX_FIELD_VALUE_LENGTH) {
        errors.push({
          path: field.id,
          message: `Must be at most ${String(MAX_FIELD_VALUE_LENGTH)} characters`,
        });
      }
      break;
    default:
      errors.push({ path: field.id, message: 'Unsupported field type' });
  }
}
