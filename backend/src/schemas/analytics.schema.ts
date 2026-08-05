import { z } from 'zod';

import { SUPPORTED_ANALYTICS_EVENT_TYPES } from '../types/analytics.types.js';
import { embedTokenParamsSchema } from './runtime.schema.js';

const analyticsDeviceSchema = z.enum(['desktop', 'tablet', 'mobile']);
const analyticsSourceSchema = z.enum(['direct', 'organic', 'referral', 'campaign']);

export const analyticsEventMetadataSchema = z
  .object({
    country: z.string().trim().max(100).optional(),
    browser: z.string().trim().max(100).optional(),
    device: analyticsDeviceSchema.optional(),
    operatingSystem: z.string().trim().max(100).optional(),
    language: z.string().trim().max(50).optional(),
    screenResolution: z.string().trim().max(50).optional(),
    timezone: z.string().trim().max(100).optional(),
    referrer: z.string().trim().max(2048).optional(),
    pageUrl: z.string().trim().max(2048).optional(),
    source: analyticsSourceSchema.optional(),
    occurredAt: z.string().datetime().optional(),
    durationMs: z.coerce.number().nonnegative().optional(),
    responseTimeMs: z.coerce.number().nonnegative().optional(),
    runtimeVersion: z.string().trim().max(50).optional(),
    fieldId: z.string().trim().max(128).optional(),
  })
  .passthrough()
  .optional();

export const ingestAnalyticsEventBodySchema = z.object({
  eventType: z.enum(SUPPORTED_ANALYTICS_EVENT_TYPES),
  sessionId: z.string().trim().min(1).max(128),
  visitorId: z.string().trim().max(128).optional(),
  metadata: analyticsEventMetadataSchema,
});

export const analyticsQuerySchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  version: z.coerce.number().int().positive().optional(),
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
  device: analyticsDeviceSchema.optional(),
  source: analyticsSourceSchema.optional(),
});

export const analyticsTimelineQuerySchema = analyticsQuerySchema.extend({
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
});

export const ingestAnalyticsEventParamsSchema = embedTokenParamsSchema;

export type IngestAnalyticsEventBody = z.infer<typeof ingestAnalyticsEventBodySchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type AnalyticsTimelineQuery = z.infer<typeof analyticsTimelineQuerySchema>;
export type IngestAnalyticsEventParams = z.infer<typeof ingestAnalyticsEventParamsSchema>;
