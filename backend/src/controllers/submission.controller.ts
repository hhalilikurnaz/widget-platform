import type { NextFunction, Request, Response } from 'express';

import type {
  ExportSubmissionsBody,
  ListSubmissionsQuery,
  SubmissionParams,
  SubmitSubmissionBody,
  SubmitSubmissionParams,
} from '../schemas/submission.schema.js';
import type { WidgetIdParams } from '../schemas/widget.schema.js';
import { submissionService } from '../services/submission.service.js';
import { getWidgetScope } from '../utils/request-auth.js';
import { sendSuccess } from '../utils/response.js';

export class SubmissionController {
  listSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const query = req.validatedQuery as ListSubmissionsQuery;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const result = await submissionService.listSubmissions(workspaceId, id, query, widget);

      sendSuccess(res, result.items, { meta: result.meta });
    } catch (error) {
      next(error);
    }
  };

  getSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, submissionId } = req.params as SubmissionParams;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const submission = await submissionService.getSubmission(workspaceId, id, submissionId, widget);

      sendSuccess(res, submission);
    } catch (error) {
      next(error);
    }
  };

  deleteSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, submissionId } = req.params as SubmissionParams;
      const { workspaceId, widget } = getWidgetScope(req, id);
      await submissionService.deleteSubmission(workspaceId, id, submissionId, widget);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  exportSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as WidgetIdParams;
      const body = req.body as ExportSubmissionsBody;
      const { workspaceId, widget } = getWidgetScope(req, id);
      const csv = await submissionService.exportSubmissions(workspaceId, id, body, widget);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  };

  submitPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { embedToken } = req.params as SubmitSubmissionParams;
      const body = req.body as SubmitSubmissionBody;
      const ipAddress = req.ip ?? '0.0.0.0';
      const userAgent = req.get('user-agent') ?? undefined;

      const result = await submissionService.submitPublic(embedToken, body, {
        ipAddress,
        userAgent,
      });

      sendSuccess(res, result, { statusCode: 201, message: result.message });
    } catch (error) {
      next(error);
    }
  };
}

export const submissionController = new SubmissionController();
