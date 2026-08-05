import { describe, expect, it } from 'vitest';

import { generateSubmissionsCsv } from '../../src/utils/submission-export.js';
import { validateSubmissionPayload } from '../../src/utils/submission-validator.js';

describe('submission validation', () => {
  const schemaFields = [
    { id: 'email', type: 'email', label: 'Email', required: true },
    { id: 'phone', type: 'phone', label: 'Phone' },
    { id: 'role', type: 'select', label: 'Role', options: ['buyer', 'seller'] },
    { id: 'newsletter', type: 'checkbox', label: 'Newsletter' },
    { id: 'website', type: 'url', label: 'Website' },
    { id: 'notes', type: 'textarea', label: 'Notes' },
  ];

  it('accepts valid payloads', () => {
    const result = validateSubmissionPayload(
      {
        email: 'john@example.com',
        phone: '+1 555 123 4567',
        role: 'buyer',
        newsletter: true,
        website: 'https://example.com',
        notes: 'Hello',
      },
      schemaFields,
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects unknown fields and invalid formats', () => {
    const result = validateSubmissionPayload(
      {
        email: 'not-an-email',
        unknown: 'value',
        role: 'invalid',
      },
      schemaFields,
    );

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.path === 'unknown')).toBe(true);
    expect(result.errors.some((error) => error.path === 'email')).toBe(true);
    expect(result.errors.some((error) => error.path === 'role')).toBe(true);
  });
});

describe('submission export', () => {
  it('generates CSV with headers and escaped values', () => {
    const csv = generateSubmissionsCsv([
      {
        date: '2026-01-01T00:00:00.000Z',
        widget: 'Contact Us',
        version: 2,
        payload: '{"email":"john@example.com"}',
        country: 'US',
        browser: 'Chrome',
        device: 'desktop',
      },
    ]);

    expect(csv).toContain('Date,Widget,Version,Payload,Country,Browser,Device');
    expect(csv).toContain('Contact Us');
    expect(csv).toContain('john@example.com');
  });
});
