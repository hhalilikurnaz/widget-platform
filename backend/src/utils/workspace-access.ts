import type { Widget } from '@prisma/client';
import type { Request } from 'express';

import { NotFoundError } from '../errors/index.js';
import { widgetRepository } from '../repositories/widget.repository.js';

export async function requireWidgetInWorkspace(
  widgetId: string,
  workspaceId: string,
): Promise<Widget> {
  const widget = await widgetRepository.findByIdForWorkspace(widgetId, workspaceId);
  if (!widget) {
    throw new NotFoundError('Widget not found');
  }

  return widget;
}

export function ensureWidgetInWorkspace(
  widgetId: string,
  workspaceId: string,
  preloaded?: Widget,
): Promise<Widget> {
  if (
    preloaded &&
    preloaded.id === widgetId &&
    preloaded.workspaceId === workspaceId &&
    preloaded.deletedAt === null
  ) {
    return Promise.resolve(preloaded);
  }

  return requireWidgetInWorkspace(widgetId, workspaceId);
}

export function getPreloadedWidget(req: Request, widgetId: string, workspaceId: string): Widget | undefined {
  const widget = req.widget;
  if (widget?.id === widgetId && widget.workspaceId === workspaceId && widget.deletedAt === null) {
    return widget;
  }

  return undefined;
}
