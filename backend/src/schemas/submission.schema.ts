import { z } from 'zod';

import { embedTokenParamsSchema } from './runtime.schema.js';
import { widgetIdParamsSchema } from './widget.schema.js';

const uuidSchema = z.string().uuid();

export const submitSubmissionBodySchema = z.object({
  fields: z.record(z.unknown()),
  metadata: z
    .object({
      referrer: z.string().trim().max(2048).optional(),
      pageUrl: z.string().trim().max(2048).optional(),
      country: z.string().trim().max(100).optional(),
      browser: z.string().trim().max(100).optional(),
      device: z.string().trim().max(100).optional(),
      honeypot: z.string().optional(),
    })
    .optional(),
});

export const listSubmissionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  search: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  country: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  browser: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  device: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  version: z.coerce.number().int().positive().optional(),
  sort: z.enum(['createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const submissionParamsSchema = widgetIdParamsSchema.extend({
  submissionId: uuidSchema,
});

export const exportSubmissionsBodySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  country: z.string().trim().max(100).optional(),
  browser: z.string().trim().max(100).optional(),
  device: z.string().trim().max(100).optional(),
  version: z.coerce.number().int().positive().optional(),
});

export const submitSubmissionParamsSchema = embedTokenParamsSchema;

export type SubmitSubmissionBody = z.infer<typeof submitSubmissionBodySchema>;
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;
export type SubmissionParams = z.infer<typeof submissionParamsSchema>;
export type ExportSubmissionsBody = z.infer<typeof exportSubmissionsBodySchema>;
export type SubmitSubmissionParams = z.infer<typeof submitSubmissionParamsSchema>;
