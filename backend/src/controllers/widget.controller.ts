import type { NextFunction, Request, Response } from 'express';

import type {
  CreateWidgetBody,
  ListWidgetsQuery,
  UpdateWidgetBody,
  WidgetIdParams,
} from '../schemas/widget.schema.js';
import { widgetService } from '../services/widget.service.js';
import { getWorkspaceScope } from '../utils/request-auth.js';
import { sendSuccess } from '../utils/response.js';

export class WidgetController {
  listWidgets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.validatedQuery as ListWidgetsQuery;
      const { workspaceId } = getWorkspaceScope(req);
      const result = await widgetService.listWidgets(workspaceId, query);

      sendSuccess(res, result.items, { meta: result.meta });
    } catch (error) {
      next(error);
    }
  };

  getWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const { workspaceId } = getWorkspaceScope(req);
      const widget = await widgetService.getWidget(workspaceId, id);
      sendSuccess(res, widget);
    } catch (error) {
      next(error);
    }
  };

  createWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as CreateWidgetBody;
      const { workspaceId, userId } = getWorkspaceScope(req);
      const widget = await widgetService.createWidget(workspaceId, userId, body);
      sendSuccess(res, widget, { statusCode: 201, message: 'Widget created' });
    } catch (error) {
      next(error);
    }
  };

  updateWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const body = req.body as UpdateWidgetBody;
      const { workspaceId } = getWorkspaceScope(req);
      const widget = await widgetService.updateWidget(workspaceId, id, body);
      sendSuccess(res, widget, { message: 'Widget updated' });
    } catch (error) {
      next(error);
    }
  };

  archiveWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const { workspaceId } = getWorkspaceScope(req);
      const widget = await widgetService.archiveWidget(workspaceId, id);
      sendSuccess(res, widget, { message: 'Widget archived' });
    } catch (error) {
      next(error);
    }
  };

  restoreWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const { workspaceId } = getWorkspaceScope(req);
      const widget = await widgetService.restoreWidget(workspaceId, id);
      sendSuccess(res, widget, { message: 'Widget restored' });
    } catch (error) {
      next(error);
    }
  };

  duplicateWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const { workspaceId, userId } = getWorkspaceScope(req);
      const widget = await widgetService.duplicateWidget(workspaceId, id, userId);
      sendSuccess(res, widget, { statusCode: 201, message: 'Widget duplicated' });
    } catch (error) {
      next(error);
    }
  };

  deleteWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const { workspaceId } = getWorkspaceScope(req);
      await widgetService.deleteWidget(workspaceId, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const widgetController = new WidgetController();
