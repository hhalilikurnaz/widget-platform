import type { NextFunction, Request, Response } from 'express';

import type {
  AnalyticsQuery,
  AnalyticsTimelineQuery,
  IngestAnalyticsEventBody,
  IngestAnalyticsEventParams,
} from '../schemas/analytics.schema.js';
import type { WidgetIdParams } from '../schemas/widget.schema.js';
import { analyticsService } from '../services/analytics.service.js';
import { getWidgetScope } from '../utils/request-auth.js';
import { sendSuccess } from '../utils/response.js';

export class AnalyticsController {
  ingestPublicEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { embedToken } = req.params as IngestAnalyticsEventParams;
      const body = req.body as IngestAnalyticsEventBody;

      await analyticsService.ingestPublicEvent(embedToken, body);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsQuery;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const overview = await analyticsService.getOverview(workspaceId, id, query, widget);

      sendSuccess(res, overview);
    } catch (error) {
      next(error);
    }
  };

  getTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsTimelineQuery;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const timeline = await analyticsService.getTimeline(workspaceId, id, query, widget);

      sendSuccess(res, timeline);
    } catch (error) {
      next(error);
    }
  };

  getDevices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsQuery;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const devices = await analyticsService.getDevices(workspaceId, id, query, widget);

      sendSuccess(res, devices);
    } catch (error) {
      next(error);
    }
  };

  getCountries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsQuery;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const countries = await analyticsService.getCountries(workspaceId, id, query, widget);

      sendSuccess(res, countries);
    } catch (error) {
      next(error);
    }
  };

  getSources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsQuery;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const sources = await analyticsService.getSources(workspaceId, id, query, widget);

      sendSuccess(res, sources);
    } catch (error) {
      next(error);
    }
  };

  getPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsQuery;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const performance = await analyticsService.getPerformance(workspaceId, id, query, widget);

      sendSuccess(res, performance);
    } catch (error) {
      next(error);
    }
  };
}

export const analyticsController = new AnalyticsController();
