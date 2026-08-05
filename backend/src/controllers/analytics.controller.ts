import type { NextFunction, Request, Response } from 'express';

import type {
  AnalyticsQuery,
  AnalyticsTimelineQuery,
  IngestAnalyticsEventBody,
  IngestAnalyticsEventParams,
} from '../schemas/analytics.schema.js';
import type { WidgetIdParams } from '../schemas/widget.schema.js';
import { analyticsService } from '../services/analytics.service.js';
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
      const overview = await analyticsService.getOverview(id, query);

      sendSuccess(res, overview);
    } catch (error) {
      next(error);
    }
  };

  getTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsTimelineQuery;
      const timeline = await analyticsService.getTimeline(id, query);

      sendSuccess(res, timeline);
    } catch (error) {
      next(error);
    }
  };

  getDevices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsQuery;
      const devices = await analyticsService.getDevices(id, query);

      sendSuccess(res, devices);
    } catch (error) {
      next(error);
    }
  };

  getCountries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsQuery;
      const countries = await analyticsService.getCountries(id, query);

      sendSuccess(res, countries);
    } catch (error) {
      next(error);
    }
  };

  getSources = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsQuery;
      const sources = await analyticsService.getSources(id, query);

      sendSuccess(res, sources);
    } catch (error) {
      next(error);
    }
  };

  getPerformance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as AnalyticsQuery;
      const performance = await analyticsService.getPerformance(id, query);

      sendSuccess(res, performance);
    } catch (error) {
      next(error);
    }
  };
}

export const analyticsController = new AnalyticsController();
