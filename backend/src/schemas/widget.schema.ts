import { WidgetStatus } from '@prisma/client';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const widgetIdParamsSchema = z.object({
  id: uuidSchema,
});

export const createWidgetBodySchema = z.object({
  workspaceId: uuidSchema,
  name: z.string().trim().min(1, 'Widget name is required').max(255),
  description: z.string().trim().max(2000).optional(),
  themeId: uuidSchema.optional(),
  createdBy: uuidSchema,
});

export const updateWidgetBodySchema = z
  .object({
    name: z.string().trim().min(1, 'Widget name is required').max(255).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    themeId: uuidSchema.nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export const duplicateWidgetBodySchema = z.object({
  createdBy: uuidSchema,
});

export const listWidgetsQuerySchema = z.object({
  workspaceId: uuidSchema,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  search: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'name']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.nativeEnum(WidgetStatus).optional(),
  themeId: uuidSchema.optional(),
  createdBy: uuidSchema.optional(),
  deleted: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? false : value === 'true')),
});

export type CreateWidgetBody = z.infer<typeof createWidgetBodySchema>;
export type UpdateWidgetBody = z.infer<typeof updateWidgetBodySchema>;
export type DuplicateWidgetBody = z.infer<typeof duplicateWidgetBodySchema>;
export type ListWidgetsQuery = z.infer<typeof listWidgetsQuerySchema>;
export type WidgetIdParams = z.infer<typeof widgetIdParamsSchema>;
