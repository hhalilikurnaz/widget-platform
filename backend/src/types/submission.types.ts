export interface PublicSubmitResultDto {
  success: true;
  message: string;
}

export interface SubmissionListItemDto {
  id: string;
  widgetId: string;
  version: number;
  preview: string;
  country: string | null;
  browser: string | null;
  device: string | null;
  createdAt: string;
}

export interface SubmissionDetailDto {
  id: string;
  widgetId: string;
  widgetName: string;
  version: number;
  payload: Record<string, unknown>;
  country: string | null;
  browser: string | null;
  device: string | null;
  referrer: string | null;
  createdAt: string;
}

export interface SubmissionExportRow {
  date: string;
  widget: string;
  version: number;
  payload: string;
  country: string;
  browser: string;
  device: string;
}

export interface CreateSubmissionInput {
  workspaceId: string;
  widgetId: string;
  widgetVersionId: string;
  payload: Record<string, unknown>;
  country?: string;
  browser?: string;
  device?: string;
  userAgent?: string;
  referrer?: string;
  ipHash?: string;
}

export interface SubmissionListFilters {
  workspaceId: string;
  widgetId: string;
  page: number;
  limit: number;
  sort: 'createdAt';
  order: 'asc' | 'desc';
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  country?: string;
  browser?: string;
  device?: string;
  version?: number;
}

export interface SubmissionExportFilters {
  workspaceId: string;
  widgetId: string;
  dateFrom?: Date;
  dateTo?: Date;
  country?: string;
  browser?: string;
  device?: string;
  version?: number;
}

export interface PaginatedSubmissions {
  items: SubmissionListItemDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubmitSubmissionContext {
  embedToken: string;
  fields: Record<string, unknown>;
  metadata?: {
    referrer?: string;
    pageUrl?: string;
    country?: string;
    browser?: string;
    device?: string;
    honeypot?: string;
  };
  ipAddress: string;
  userAgent?: string;
}
