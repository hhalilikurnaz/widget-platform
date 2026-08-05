import type { Widget } from '@prisma/client';

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
