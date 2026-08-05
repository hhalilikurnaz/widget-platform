import { randomBytes } from 'node:crypto';

export function generateEmbedToken(): string {
  return `wt_${randomBytes(16).toString('hex')}`;
}
