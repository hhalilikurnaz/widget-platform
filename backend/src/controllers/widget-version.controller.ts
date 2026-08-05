import type { NextFunction, Request, Response } from 'express';

import type { WidgetIdParams } from '../schemas/widget.schema.js';
import type { WidgetVersionParams } from '../schemas/widget-version.schema.js';
import { widgetVersionService } from '../services/widget-version.service.js';
import { getWidgetScope } from '../utils/request-auth.js';
import { sendSuccess } from '../utils/response.js';

export class WidgetVersionController {
  publishWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const { workspaceId } = getWidgetScope(req, id);
      const result = await widgetVersionService.publishWidget(id, workspaceId);
      sendSuccess(res, result, { message: 'Widget published' });
    } catch (error) {
      next(error);
    }
  };

  unpublishWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const { workspaceId } = getWidgetScope(req, id);
      const result = await widgetVersionService.unpublishWidget(id, workspaceId);
      sendSuccess(res, result, { message: 'Widget unpublished' });
    } catch (error) {
      next(error);
    }
  };

  listVersions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const versions = await widgetVersionService.listVersions(id, workspaceId, widget);
      sendSuccess(res, versions);
    } catch (error) {
      next(error);
    }
  };

  getVersion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, versionId } = req.params as WidgetVersionParams;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const version = await widgetVersionService.getVersion(id, workspaceId, versionId, widget);
      sendSuccess(res, version);
    } catch (error) {
      next(error);
    }
  };

  restoreVersion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, versionId } = req.params as WidgetVersionParams;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const result = await widgetVersionService.restoreVersion(id, workspaceId, versionId, widget);
      sendSuccess(res, result, { message: 'Version restored' });
    } catch (error) {
      next(error);
    }
  };
}

export const widgetVersionController = new WidgetVersionController();
