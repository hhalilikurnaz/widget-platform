import { DUPLICATE_SUBMISSION_WINDOW_MS } from '../constants/index.js';
import { ConflictError, NotFoundError, ValidationError } from '../errors/index.js';
import { logger } from '../logger/index.js';
import { runtimeRepository } from '../repositories/runtime.repository.js';
import { submissionRepository } from '../repositories/submission.repository.js';
import { requireWidgetInWorkspace } from '../utils/workspace-access.js';
import type {
  ExportSubmissionsBody,
  ListSubmissionsQuery,
  SubmitSubmissionBody,
} from '../schemas/submission.schema.js';
import type {
  PaginatedSubmissions,
  PublicSubmitResultDto,
  SubmissionDetailDto,
  SubmitSubmissionContext,
} from '../types/submission.types.js';
import { generateSubmissionsCsv } from '../utils/submission-export.js';
import { hashIp } from '../utils/ip-hash.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import {
  extractSchemaFields,
  toPublicSubmitResult,
  toSubmissionDetail,
  toSubmissionExportRow,
  toSubmissionListItem,
} from '../utils/submission-mapper.js';
import {
  validateSubmissionPayload,
} from '../utils/submission-validator.js';

const NOT_FOUND_MESSAGE = 'Widget not found';
const SUBMISSION_NOT_FOUND_MESSAGE = 'Submission not found';

export class SubmissionService {
  async submitPublic(
    embedToken: string,
    body: SubmitSubmissionBody,
    context: Omit<SubmitSubmissionContext, 'embedToken' | 'fields'>,
  ): Promise<PublicSubmitResultDto> {
    const record = await runtimeRepository.findPublishedByEmbedToken(embedToken);

    if (!record) {
      logger.info({ embedToken }, 'Submission rejected');
      throw new NotFoundError(NOT_FOUND_MESSAGE);
    }

    logger.info({ embedToken, widgetId: record.widget.id }, 'Submission received');

    if (body.metadata?.honeypot) {
      logger.info({ embedToken, widgetId: record.widget.id }, 'Submission rejected');
      throw new ValidationError('Invalid submission');
    }

    const schemaFields = extractSchemaFields(record.publishedVersion.schemaJson);
    const validation = validateSubmissionPayload(body.fields, schemaFields);

    if (!validation.valid) {
      logger.info(
        { embedToken, widgetId: record.widget.id, errors: validation.errors },
        'Submission rejected',
      );
      throw new ValidationError('Submission validation failed', {
        errors: validation.errors,
      });
    }

    const ipHash = hashIp(context.ipAddress);
    const since = new Date(Date.now() - DUPLICATE_SUBMISSION_WINDOW_MS);
    const duplicate = await submissionRepository.findRecentDuplicate({
      widgetId: record.widget.id,
      ipHash,
      payload: body.fields,
      since,
    });

    if (duplicate) {
      logger.info({ embedToken, widgetId: record.widget.id }, 'Submission rejected');
      throw new ConflictError('Duplicate submission detected');
    }

    await submissionRepository.createSubmission({
      workspaceId: record.widget.workspaceId,
      widgetId: record.widget.id,
      widgetVersionId: record.publishedVersion.id,
      payload: body.fields,
      country: body.metadata?.country ?? context.metadata?.country,
      browser: body.metadata?.browser ?? context.metadata?.browser,
      device: body.metadata?.device ?? context.metadata?.device,
      userAgent: context.userAgent,
      referrer: body.metadata?.referrer ?? body.metadata?.pageUrl ?? context.metadata?.referrer,
      ipHash,
    });

    logger.info({ embedToken, widgetId: record.widget.id }, 'Submission stored');

    return toPublicSubmitResult();
  }

  async listSubmissions(
    workspaceId: string,
    widgetId: string,
    query: ListSubmissionsQuery,
  ): Promise<PaginatedSubmissions> {
    await requireWidgetInWorkspace(widgetId, workspaceId);

    const pagination = parsePagination(query.page, query.limit);
    const { items, total } = await submissionRepository.findSubmissions({
      workspaceId,
      widgetId,
      page: pagination.page,
      limit: pagination.limit,
      sort: query.sort,
      order: query.order,
      search: query.search,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      country: query.country,
      browser: query.browser,
      device: query.device,
      version: query.version,
    });

    return {
      items: items.map(toSubmissionListItem),
      meta: buildPaginationMeta(pagination.page, pagination.limit, total),
    };
  }

  async getSubmission(
    workspaceId: string,
    widgetId: string,
    submissionId: string,
  ): Promise<SubmissionDetailDto> {
    await requireWidgetInWorkspace(widgetId, workspaceId);

    const submission = await submissionRepository.findSubmission(workspaceId, widgetId, submissionId);
    if (!submission) {
      throw new NotFoundError(SUBMISSION_NOT_FOUND_MESSAGE);
    }

    return toSubmissionDetail(submission, submission.widget.name);
  }

  async deleteSubmission(workspaceId: string, widgetId: string, submissionId: string): Promise<void> {
    await requireWidgetInWorkspace(widgetId, workspaceId);

    const submission = await submissionRepository.findSubmission(workspaceId, widgetId, submissionId);
    if (!submission) {
      throw new NotFoundError(SUBMISSION_NOT_FOUND_MESSAGE);
    }

    await submissionRepository.deleteSubmission(workspaceId, widgetId, submissionId);
  }

  async exportSubmissions(workspaceId: string, widgetId: string, body: ExportSubmissionsBody): Promise<string> {
    await requireWidgetInWorkspace(widgetId, workspaceId);

    const rows = await submissionRepository.exportSubmissions({
      workspaceId,
      widgetId,
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      country: body.country,
      browser: body.browser,
      device: body.device,
      version: body.version,
    });

    logger.info({ widgetId, count: rows.length }, 'Submission exported');

    return generateSubmissionsCsv(rows.map(toSubmissionExportRow));
  }
}

export const submissionService = new SubmissionService();
