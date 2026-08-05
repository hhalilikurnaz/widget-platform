import type { NextFunction, Request, Response } from 'express';

import { NotFoundError, UnauthorizedError } from '../errors/index.js';
import { widgetRepository } from '../repositories/widget.repository.js';

export function requireOwnership() {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.workspace) {
        throw new UnauthorizedError('Workspace context required');
      }

      const rawWidgetId = req.params.id;
      const widgetId = typeof rawWidgetId === 'string' ? rawWidgetId : rawWidgetId?.[0];
      if (!widgetId) {
        next();
        return;
      }

      const widget = await widgetRepository.findByIdForWorkspace(widgetId, req.workspace.id);
      if (!widget) {
        throw new NotFoundError('Widget not found');
      }

      req.widget = widget;
      next();
    } catch (error) {
      next(error);
    }
  };
}
