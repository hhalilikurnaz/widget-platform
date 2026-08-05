import {
  LAYOUT_ALIGNMENTS,
  LAYOUT_TYPES,
  SUPPORTED_FIELD_TYPES,
  TRIGGER_TYPES,
  type SchemaValidationError,
  type SchemaValidationResult,
  type WidgetSchemaDocument,
} from '../types/widget-schema.types.js';
import { isSupportedSchemaVersion, normalizeSchemaDocument } from './schema-version.js';

const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

export function validateWidgetSchema(input: unknown): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];

  if (!isRecord(input)) {
    return {
      valid: false,
      errors: [{ path: 'schema', message: 'Schema must be a JSON object' }],
    };
  }

  const schema = normalizeSchemaDocument(input);

  if (!isSupportedSchemaVersion(schema.version)) {
    errors.push({
      path: 'version',
      message: `Schema version must be one of: ${String(1)}`,
    });
  }

  validateContent(schema, errors);
  validateLayout(schema, errors);
  validateTheme(schema, errors);
  validateFields(schema, errors);
  validateBehavior(schema, errors);
  validateTriggers(schema, errors);
  validateLocalization(schema, errors);
  validateAnimations(schema, errors);
  validateMetadata(schema, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateContent(schema: WidgetSchemaDocument, errors: SchemaValidationError[]): void {
  if (!isRecord(schema.content)) {
    errors.push({ path: 'content', message: 'Content must be an object' });
    return;
  }

  if ('title' in schema.content && typeof schema.content.title !== 'string') {
    errors.push({ path: 'content.title', message: 'Title must be a string' });
  }

  if ('subtitle' in schema.content && typeof schema.content.subtitle !== 'string') {
    errors.push({ path: 'content.subtitle', message: 'Subtitle must be a string' });
  }

  if ('description' in schema.content && typeof schema.content.description !== 'string') {
    errors.push({ path: 'content.description', message: 'Description must be a string' });
  }
}

function validateLayout(schema: WidgetSchemaDocument, errors: SchemaValidationError[]): void {
  if (!isRecord(schema.layout)) {
    errors.push({ path: 'layout', message: 'Layout must be an object' });
    return;
  }

  if ('type' in schema.layout) {
    if (typeof schema.layout.type !== 'string' || !LAYOUT_TYPES.includes(schema.layout.type as (typeof LAYOUT_TYPES)[number])) {
      errors.push({
        path: 'layout.type',
        message: `Layout type must be one of: ${LAYOUT_TYPES.join(', ')}`,
      });
    }
  }

  if ('width' in schema.layout && typeof schema.layout.width !== 'string') {
    errors.push({ path: 'layout.width', message: 'Layout width must be a string' });
  }

  if ('alignment' in schema.layout) {
    if (
      typeof schema.layout.alignment !== 'string' ||
      !LAYOUT_ALIGNMENTS.includes(schema.layout.alignment as (typeof LAYOUT_ALIGNMENTS)[number])
    ) {
      errors.push({
        path: 'layout.alignment',
        message: `Layout alignment must be one of: ${LAYOUT_ALIGNMENTS.join(', ')}`,
      });
    }
  }
}

function validateTheme(schema: WidgetSchemaDocument, errors: SchemaValidationError[]): void {
  if (!isRecord(schema.theme)) {
    errors.push({ path: 'theme', message: 'Theme must be an object' });
    return;
  }

  if (isRecord(schema.theme.colors)) {
    for (const [key, value] of Object.entries(schema.theme.colors)) {
      if (typeof value === 'string' && value.length > 0 && !HEX_COLOR_PATTERN.test(value)) {
        errors.push({
          path: `theme.colors.${key}`,
          message: 'Theme color values must be valid hex colors',
        });
      }
    }
  }
}

function validateFields(schema: WidgetSchemaDocument, errors: SchemaValidationError[]): void {
  const seenIds = new Set<string>();

  for (const [index, field] of schema.fields.entries()) {
    const basePath = `fields[${String(index)}]`;

    if (!field.id || field.id.trim().length === 0) {
      errors.push({ path: `${basePath}.id`, message: 'Field id is required' });
    } else if (seenIds.has(field.id)) {
      errors.push({ path: `${basePath}.id`, message: `Duplicate field id: ${field.id}` });
    } else {
      seenIds.add(field.id);
    }

    if (!SUPPORTED_FIELD_TYPES.includes(field.type)) {
      errors.push({
        path: `${basePath}.type`,
        message: `Field type must be one of: ${SUPPORTED_FIELD_TYPES.join(', ')}`,
      });
    }

    if (!field.label || field.label.trim().length === 0) {
      errors.push({ path: `${basePath}.label`, message: 'Field label is required' });
    }

    if (field.type === 'select' || field.type === 'radio') {
      if (!field.options || field.options.length === 0) {
        errors.push({
          path: `${basePath}.options`,
          message: `${field.type} fields require at least one option`,
        });
      }
    }
  }
}

function validateBehavior(schema: WidgetSchemaDocument, errors: SchemaValidationError[]): void {
  if (!isRecord(schema.behavior)) {
    errors.push({ path: 'behavior', message: 'Behavior must be an object' });
  }
}

function validateTriggers(schema: WidgetSchemaDocument, errors: SchemaValidationError[]): void {
  if (!isRecord(schema.triggers)) {
    errors.push({ path: 'triggers', message: 'Triggers must be an object' });
    return;
  }

  if ('type' in schema.triggers) {
    if (
      typeof schema.triggers.type !== 'string' ||
      !TRIGGER_TYPES.includes(schema.triggers.type as (typeof TRIGGER_TYPES)[number])
    ) {
      errors.push({
        path: 'triggers.type',
        message: `Trigger type must be one of: ${TRIGGER_TYPES.join(', ')}`,
      });
    }
  }

  if ('delay' in schema.triggers && typeof schema.triggers.delay !== 'number') {
    errors.push({ path: 'triggers.delay', message: 'Trigger delay must be a number' });
  }

  if ('scrollDepth' in schema.triggers && typeof schema.triggers.scrollDepth !== 'number') {
    errors.push({ path: 'triggers.scrollDepth', message: 'Trigger scrollDepth must be a number' });
  }

  if ('clickSelector' in schema.triggers && typeof schema.triggers.clickSelector !== 'string') {
    errors.push({ path: 'triggers.clickSelector', message: 'Trigger clickSelector must be a string' });
  }
}

function validateLocalization(schema: WidgetSchemaDocument, errors: SchemaValidationError[]): void {
  if (!isRecord(schema.localization)) {
    errors.push({ path: 'localization', message: 'Localization must be an object' });
    return;
  }

  if ('defaultLocale' in schema.localization) {
    const locale = schema.localization.defaultLocale;
    if (typeof locale !== 'string' || !LOCALE_PATTERN.test(locale)) {
      errors.push({
        path: 'localization.defaultLocale',
        message: 'Default locale must be a valid language code (e.g. en, en-US)',
      });
    }
  }

  if ('locales' in schema.localization && !isRecord(schema.localization.locales)) {
    errors.push({ path: 'localization.locales', message: 'Localization locales must be an object' });
  }
}

function validateAnimations(schema: WidgetSchemaDocument, errors: SchemaValidationError[]): void {
  if (!isRecord(schema.animations)) {
    errors.push({ path: 'animations', message: 'Animations must be an object' });
  }
}

function validateMetadata(schema: WidgetSchemaDocument, errors: SchemaValidationError[]): void {
  if (!isRecord(schema.metadata)) {
    errors.push({ path: 'metadata', message: 'Metadata must be an object' });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
