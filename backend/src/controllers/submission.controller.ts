import type { NextFunction, Request, Response } from 'express';

import type {
  ExportSubmissionsBody,
  ListSubmissionsQuery,
  SubmissionParams,
  SubmitSubmissionBody,
  SubmitSubmissionParams,
} from '../schemas/submission.schema.js';
import { submissionService } from '../services/submission.service.js';
import { sendSuccess } from '../utils/response.js';

export class SubmissionController {
  listSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as SubmissionParams;
      const query = req.validatedQuery as ListSubmissionsQuery;
      const result = await submissionService.listSubmissions(id, query);

      sendSuccess(res, result.items, { meta: result.meta });
    } catch (error) {
      next(error);
    }
  };

  getSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, submissionId } = req.params as SubmissionParams;
      const submission = await submissionService.getSubmission(id, submissionId);

      sendSuccess(res, submission);
    } catch (error) {
      next(error);
    }
  };

  deleteSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, submissionId } = req.params as SubmissionParams;
      await submissionService.deleteSubmission(id, submissionId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  exportSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as SubmissionParams;
      const body = req.body as ExportSubmissionsBody;
      const csv = await submissionService.exportSubmissions(id, body);

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
