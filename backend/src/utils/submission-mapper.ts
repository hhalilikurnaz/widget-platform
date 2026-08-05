import type { Submission, WidgetVersion } from '@prisma/client';

import type {
  PublicSubmitResultDto,
  SubmissionDetailDto,
  SubmissionExportRow,
  SubmissionListItemDto,
} from '../types/submission.types.js';
import type { WidgetField } from '../types/widget-schema.types.js';
import { normalizeSchemaDocument } from './schema-version.js';

export function extractSchemaFields(schemaJson: unknown): WidgetField[] {
  return normalizeSchemaDocument(schemaJson).fields;
}

export function toSubmissionListItem(
  submission: Submission & { widgetVersion: Pick<WidgetVersion, 'version'> },
): SubmissionListItemDto {
  return {
    id: submission.id,
    widgetId: submission.widgetId,
    version: submission.widgetVersion.version,
    preview: buildSubmissionPreview(submission.payload),
    country: submission.country,
    browser: submission.browser,
    device: submission.device,
    createdAt: submission.createdAt.toISOString(),
  };
}

export function toSubmissionDetail(
  submission: Submission & { widgetVersion: Pick<WidgetVersion, 'version'> },
  widgetName: string,
): SubmissionDetailDto {
  return {
    id: submission.id,
    widgetId: submission.widgetId,
    widgetName,
    version: submission.widgetVersion.version,
    payload: submission.payload as Record<string, unknown>,
    country: submission.country,
    browser: submission.browser,
    device: submission.device,
    referrer: submission.referrer,
    createdAt: submission.createdAt.toISOString(),
  };
}

export function toPublicSubmitResult(message = 'Thank you for your submission!'): PublicSubmitResultDto {
  return {
    success: true,
    message,
  };
}

export function toSubmissionExportRow(
  submission: Submission & {
    widget: { name: string };
    widgetVersion: Pick<WidgetVersion, 'version'>;
  },
): SubmissionExportRow {
  return {
    date: submission.createdAt.toISOString(),
    widget: submission.widget.name,
    version: submission.widgetVersion.version,
    payload: JSON.stringify(submission.payload),
    country: submission.country ?? '',
    browser: submission.browser ?? '',
    device: submission.device ?? '',
  };
}

function buildSubmissionPreview(payload: unknown): string {
  if (!isRecord(payload)) {
    return '';
  }

  for (const value of Object.values(payload)) {
    if (typeof value === 'string' && value.length > 0) {
      return value.slice(0, 120);
    }
  }

  return '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
