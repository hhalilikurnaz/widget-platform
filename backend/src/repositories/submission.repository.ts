import { Prisma, type Submission } from '@prisma/client';

import { prisma } from '../database/prisma.js';
import type {
  CreateSubmissionInput,
  SubmissionExportFilters,
  SubmissionListFilters,
} from '../types/submission.types.js';
import { hashPayload } from '../utils/ip-hash.js';
import { paginationSkip } from '../utils/pagination.js';

export class SubmissionRepository {
  async createSubmission(input: CreateSubmissionInput): Promise<Submission> {
    return prisma.submission.create({
      data: {
        workspaceId: input.workspaceId,
        widgetId: input.widgetId,
        widgetVersionId: input.widgetVersionId,
        payload: input.payload as Prisma.InputJsonValue,
        country: input.country,
        browser: input.browser,
        device: input.device,
        userAgent: input.userAgent,
        referrer: input.referrer,
        ipHash: input.ipHash,
      },
    });
  }

  async findRecentDuplicate(input: {
    widgetId: string;
    ipHash: string;
    payload: Record<string, unknown>;
    since: Date;
  }): Promise<Submission | null> {
    const payloadHash = hashPayload(input.payload);
    const recent = await prisma.submission.findMany({
      where: {
        widgetId: input.widgetId,
        ipHash: input.ipHash,
        deletedAt: null,
        createdAt: { gte: input.since },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return (
      recent.find((submission) => {
        if (!isRecord(submission.payload)) {
          return false;
        }
        return hashPayload(submission.payload) === payloadHash;
      }) ?? null
    );
  }

  async findSubmissions(
    filters: SubmissionListFilters,
  ): Promise<{ items: Array<Submission & { widgetVersion: { version: number } }>; total: number }> {
    const where = await this.buildWhere(filters);

    const [items, total] = await prisma.$transaction([
      prisma.submission.findMany({
        where,
        include: {
          widgetVersion: {
            select: { version: true },
          },
        },
        orderBy: { createdAt: filters.order },
        skip: paginationSkip(filters.page, filters.limit),
        take: filters.limit,
      }),
      prisma.submission.count({ where }),
    ]);

    return { items, total };
  }

  async findSubmission(
    workspaceId: string,
    widgetId: string,
    submissionId: string,
  ): Promise<(Submission & { widgetVersion: { version: number }; widget: { name: string } }) | null> {
    return prisma.submission.findFirst({
      where: {
        id: submissionId,
        widgetId,
        workspaceId,
        deletedAt: null,
      },
      include: {
        widgetVersion: { select: { version: true } },
        widget: { select: { name: true } },
      },
    });
  }

  async deleteSubmission(workspaceId: string, widgetId: string, submissionId: string): Promise<void> {
    await prisma.submission.updateMany({
      where: {
        id: submissionId,
        widgetId,
        workspaceId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async exportSubmissions(
    filters: SubmissionExportFilters,
  ): Promise<Array<Submission & { widget: { name: string }; widgetVersion: { version: number } }>> {
    const where = await this.buildWhere({
      ...filters,
      page: 1,
      limit: 10000,
      sort: 'createdAt',
      order: 'desc',
    });

    return prisma.submission.findMany({
      where,
      include: {
        widget: { select: { name: true } },
        widgetVersion: { select: { version: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });
  }

  private async buildWhere(
    filters: SubmissionListFilters | SubmissionExportFilters,
  ): Promise<Prisma.SubmissionWhereInput> {
    const where: Prisma.SubmissionWhereInput = {
      workspaceId: filters.workspaceId,
      widgetId: filters.widgetId,
      deletedAt: null,
    };

    if (filters.country) {
      where.country = filters.country;
    }

    if (filters.browser) {
      where.browser = filters.browser;
    }

    if (filters.device) {
      where.device = filters.device;
    }

    if (filters.version !== undefined) {
      where.widgetVersion = { version: filters.version };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

    if ('search' in filters && filters.search) {
      const ids = await this.findSubmissionIdsByPayloadSearch(filters.widgetId, filters.search);
      where.id = { in: ids.length > 0 ? ids : ['00000000-0000-0000-0000-000000000000'] };
    }

    return where;
  }

  private async findSubmissionIdsByPayloadSearch(widgetId: string, search: string): Promise<string[]> {
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM submissions
      WHERE widget_id = ${widgetId}::uuid
        AND deleted_at IS NULL
        AND payload::text ILIKE ${`%${search}%`}
    `;

    return rows.map((row) => row.id);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const submissionRepository = new SubmissionRepository();
