import { createHash } from 'node:crypto';

import { env } from '../config/env.js';

const IP_HASH_FALLBACK = 'widget-platform-dev-ip-hash-secret';

export function hashIp(ip: string): string {
  const secret = env.IP_HASH_SECRET ?? IP_HASH_FALLBACK;
  return createHash('sha256').update(`${secret}:${ip}`).digest('hex');
}

export function hashPayload(payload: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}
