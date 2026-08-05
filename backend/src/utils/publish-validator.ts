import type { Widget, WidgetVersion } from '@prisma/client';

import type { PublishValidationError, PublishValidationResult } from '../types/widget-version.types.js';
import { validateWidgetSchema } from './schema-validator.js';

export interface PublishValidationContext {
  widget: Widget;
  version: WidgetVersion | null;
  slugConflict: boolean;
}

export function validateForPublish(context: PublishValidationContext): PublishValidationResult {
  const errors: PublishValidationError[] = [];
  const { widget, version, slugConflict } = context;

  if (widget.deletedAt) {
    errors.push({ path: 'widget', message: 'Deleted widgets cannot be published' });
  }

  if (!widget.name || widget.name.trim().length === 0) {
    errors.push({ path: 'name', message: 'Widget name is required' });
  }

  if (!version) {
    errors.push({ path: 'version', message: 'Current draft version does not exist' });
    return { valid: false, errors };
  }

  if (version.published) {
    errors.push({
      path: 'version',
      message: 'No draft version available to publish. Restore a version to create a new draft.',
    });
  }

  if (slugConflict) {
    errors.push({
      path: 'slug',
      message: 'Another widget in this workspace already uses this slug',
    });
  }

  if (!isRecord(version.schemaJson)) {
    errors.push({ path: 'schema', message: 'Widget schema is required' });
    return { valid: false, errors };
  }

  const schemaValidation = validateWidgetSchema(version.schemaJson);
  if (!schemaValidation.valid) {
    for (const error of schemaValidation.errors) {
      errors.push({ path: `schema.${error.path}`, message: error.message });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
