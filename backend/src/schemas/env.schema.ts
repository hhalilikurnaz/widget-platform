import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  CORS_ORIGIN: z.string().url('CORS_ORIGIN must be a valid URL').optional(),
  IP_HASH_SECRET: z.string().min(16, 'IP_HASH_SECRET must be at least 16 characters').optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(input: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(input);

  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    const message = Object.entries(formatted)
      .map(([key, errors]) => `${key}: ${errors.join(', ')}`)
      .join('; ');

    throw new Error(`Environment validation failed: ${message}`);
  }

  return result.data;
}
