export const APP_VERSION = '1.0.0';

export const DEFAULT_CORS_ORIGIN = 'http://localhost:3000';

export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export const RATE_LIMIT_MAX_REQUESTS = 100;

export const DATABASE_STATUS = {
  CONNECTED: 'connected',
  NOT_CONNECTED: 'not_connected',
} as const;

export type DatabaseStatus = (typeof DATABASE_STATUS)[keyof typeof DATABASE_STATUS];

export const RUNTIME_VERSION = '1.0.0';

export const RUNTIME_CDN_ORIGIN = 'https://cdn.widgetplatform.com';

export const PUBLIC_CACHE_MAX_AGE_SECONDS = 300;

export const PUBLIC_RATE_LIMIT_WINDOW_MS = 60 * 1000;

export const PUBLIC_RATE_LIMIT_MAX_REQUESTS = 200;

export const EMBED_TOKEN_PATTERN = /^wt_[a-f0-9]{32}$/;
