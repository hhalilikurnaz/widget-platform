import type { NextFunction, Request, Response } from 'express';

import type { WidgetIdParams } from '../schemas/widget.schema.js';
import type { WidgetVersionParams } from '../schemas/widget-version.schema.js';
import { widgetVersionService } from '../services/widget-version.service.js';
import { sendSuccess } from '../utils/response.js';

export class WidgetVersionController {
  publishWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const result = await widgetVersionService.publishWidget(id);
      sendSuccess(res, result, { message: 'Widget published' });
    } catch (error) {
      next(error);
    }
  };

  unpublishWidget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const result = await widgetVersionService.unpublishWidget(id);
      sendSuccess(res, result, { message: 'Widget unpublished' });
    } catch (error) {
      next(error);
    }
  };

  listVersions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const versions = await widgetVersionService.listVersions(id);
      sendSuccess(res, versions);
    } catch (error) {
      next(error);
    }
  };

  getVersion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, versionId } = req.params as WidgetVersionParams;
      const version = await widgetVersionService.getVersion(id, versionId);
      sendSuccess(res, version);
    } catch (error) {
      next(error);
    }
  };

  restoreVersion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, versionId } = req.params as WidgetVersionParams;
      const result = await widgetVersionService.restoreVersion(id, versionId);
      sendSuccess(res, result, { message: 'Version restored' });
    } catch (error) {
      next(error);
    }
  };
}

export const widgetVersionController = new WidgetVersionController();
