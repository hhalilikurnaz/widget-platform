import { describe, expect, it } from 'vitest';

import { validateWidgetSchema } from '../../src/utils/schema-validator.js';
import { createDefaultSchema } from '../../src/utils/schema-default.js';

describe('validateWidgetSchema', () => {
  it('accepts a valid default schema', () => {
    const result = validateWidgetSchema(createDefaultSchema('Lead Form'));

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects duplicate field ids', () => {
    const result = validateWidgetSchema({
      version: 1,
      content: {},
      layout: {},
      theme: {},
      fields: [
        { id: 'field-email', type: 'email', label: 'Email' },
        { id: 'field-email', type: 'text', label: 'Name' },
      ],
      behavior: {},
      triggers: {},
      localization: {},
      animations: {},
      metadata: {},
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.message.includes('Duplicate field id'))).toBe(true);
  });

  it('rejects unsupported field types', () => {
    const result = validateWidgetSchema({
      version: 1,
      content: {},
      layout: {},
      theme: {},
      fields: [{ id: 'field-1', type: 'password', label: 'Password' }],
      behavior: {},
      triggers: {},
      localization: {},
      animations: {},
      metadata: {},
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.path.endsWith('.type'))).toBe(true);
  });

  it('requires options for select fields', () => {
    const result = validateWidgetSchema({
      version: 1,
      content: {},
      layout: {},
      theme: {},
      fields: [{ id: 'field-select', type: 'select', label: 'Service' }],
      behavior: {},
      triggers: {},
      localization: {},
      animations: {},
      metadata: {},
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.path.includes('options'))).toBe(true);
  });

  it('validates trigger and layout values', () => {
    const result = validateWidgetSchema({
      version: 1,
      content: { title: 'Test' },
      layout: { type: 'invalid', alignment: 'middle' },
      theme: {},
      fields: [],
      behavior: {},
      triggers: { type: 'invalid-trigger' },
      localization: { defaultLocale: 'invalid-locale' },
      animations: {},
      metadata: {},
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.path === 'layout.type')).toBe(true);
    expect(result.errors.some((error) => error.path === 'layout.alignment')).toBe(true);
    expect(result.errors.some((error) => error.path === 'triggers.type')).toBe(true);
    expect(result.errors.some((error) => error.path === 'localization.defaultLocale')).toBe(true);
  });

  it('validates legacy component field definitions', () => {
    const result = validateWidgetSchema({
      version: 1,
      content: { title: 'Legacy Form' },
      components: [
        {
          id: 'field-email',
          type: 'field',
          properties: { label: 'Email', fieldType: 'email', required: true },
        },
      ],
      behavior: {},
      triggers: { type: 'immediate' },
    });

    expect(result.valid).toBe(true);
  });
});
