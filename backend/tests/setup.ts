import { config } from 'dotenv';

config({ path: '.env.test', override: true });

process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '4001';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.SUPABASE_URL ??= 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY ??= 'test-service-role-key';
