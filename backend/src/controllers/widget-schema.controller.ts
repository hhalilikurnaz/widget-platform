import type { NextFunction, Request, Response } from 'express';

import type { WidgetIdParams } from '../schemas/widget.schema.js';
import type { WidgetSchemaBody } from '../schemas/widget-schema.schema.js';
import { widgetSchemaService } from '../services/widget-schema.service.js';
import { getWidgetScope } from '../utils/request-auth.js';
import { sendSuccess } from '../utils/response.js';

export class WidgetSchemaController {
  getSchema = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const { workspaceId } = getWidgetScope(req, id);
      const schema = await widgetSchemaService.getSchema(id, workspaceId);
      sendSuccess(res, schema);
    } catch (error) {
      next(error);
    }
  };

  updateSchema = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const body = req.body as WidgetSchemaBody;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const schema = await widgetSchemaService.updateSchema(id, workspaceId, body.schema, widget);
      sendSuccess(res, schema, { message: 'Schema updated' });
    } catch (error) {
      next(error);
    }
  };

  resetSchema = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const schema = await widgetSchemaService.resetSchema(id, workspaceId, widget);
      sendSuccess(res, schema, { message: 'Schema reset' });
    } catch (error) {
      next(error);
    }
  };

  validateSchema = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const body = req.body as WidgetSchemaBody;
      const result = widgetSchemaService.validateSchema(body.schema);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const widgetSchemaController = new WidgetSchemaController();
