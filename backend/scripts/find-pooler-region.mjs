import dotenv from 'dotenv';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cwd = resolve(__dirname, '..');

dotenv.config({ path: resolve(cwd, '.env') });

const currentUrl = process.env.DATABASE_URL ?? '';
const passwordMatch = currentUrl.match(/postgres(?:\.\w+)?:([^@]+)@/);
if (!passwordMatch) {
  console.error('Could not parse password from DATABASE_URL in .env');
  process.exit(1);
}

const password = decodeURIComponent(passwordMatch[1]);
const projectRef = 'nirpqftawbfdzxdicgqi';

const regions = [
  'eu-central-1',
  'eu-central-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'eu-south-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ap-south-1',
  'ap-south-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-east-1',
  'sa-east-1',
  'ca-central-1',
  'ca-west-1',
  'me-central-1',
  'af-south-1',
  'il-central-1',
];

const candidates = [];

for (const prefix of ['aws-0', 'aws-1', 'aws-2']) {
  for (const region of regions) {
    candidates.push({
      host: `${prefix}-${region}.pooler.supabase.com`,
      port: 5432,
      query: 'sslmode=require',
    });
    candidates.push({
      host: `${prefix}-${region}.pooler.supabase.com`,
      port: 6543,
      query: 'pgbouncer=true&sslmode=require',
    });
  }
}

let reachable = 0;
let tenantMiss = 0;

for (const { host, port, query } of candidates) {
  const url = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${host}:${port}/postgres?${query}`;
  try {
    execSync('npx prisma db execute --stdin', {
      input: 'SELECT 1;',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, DATABASE_URL: url },
      cwd,
    });
    console.log(`FOUND_HOST=${host}:${port}`);
    process.exit(0);
  } catch (error) {
    const stderr = error?.stderr?.toString() ?? '';
    if (stderr.includes('ENOTFOUND) tenant') || stderr.includes('Tenant or user not found')) {
      tenantMiss += 1;
      continue;
    }
    if (stderr.includes('P1001')) {
      continue;
    }
    if (stderr.includes('password authentication failed')) {
      console.log(`AUTH_FAIL=${host}:${port}`);
      process.exit(2);
    }
    if (stderr.includes('Script executed successfully') === false && stderr.includes('P1001') === false) {
      reachable += 1;
    }
  }
}

console.log(`SUMMARY tenant_miss=${tenantMiss} checked=${candidates.length}`);
console.log('NO_HOST_FOUND');
process.exit(1);
