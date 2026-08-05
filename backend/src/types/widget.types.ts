import type { WidgetStatus } from '@prisma/client';

export interface WidgetDto {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  status: WidgetStatus;
  description: string | null;
  embedToken: string | null;
  themeId: string | null;
  createdBy: string;
  currentVersionId: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  deletedAt: string | null;
}

export interface WidgetListFilters {
  workspaceId: string;
  status?: WidgetStatus;
  themeId?: string;
  createdBy?: string;
  deleted?: boolean;
  search?: string;
  sort: 'createdAt' | 'updatedAt' | 'publishedAt' | 'name';
  order: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface CreateWidgetInput {
  name: string;
  description?: string;
  themeId?: string;
}

export interface UpdateWidgetInput {
  name?: string;
  description?: string | null;
  themeId?: string | null;
}

export interface PaginatedWidgets {
  items: WidgetDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
