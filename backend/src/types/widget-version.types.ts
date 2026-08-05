export interface WidgetVersionSummaryDto {
  id: string;
  version: number;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: string;
}

export interface WidgetVersionDetailDto extends WidgetVersionSummaryDto {
  widgetId: string;
  schema: Record<string, unknown>;
}

export interface PublishWidgetResultDto {
  id: string;
  status: 'PUBLISHED';
  version: number;
  versionId: string;
  embedToken: string;
  embedSnippet: string;
  publicConfigUrl: string;
  publishedAt: string;
}

export interface UnpublishWidgetResultDto {
  id: string;
  status: 'DRAFT';
  publishedAt: null;
}

export interface RestoreVersionResultDto {
  widgetId: string;
  versionId: string;
  version: number;
  status: 'DRAFT';
  restoredFromVersion: number;
}

export interface PublishValidationError {
  path: string;
  message: string;
}

export interface PublishValidationResult {
  valid: boolean;
  errors: PublishValidationError[];
}
