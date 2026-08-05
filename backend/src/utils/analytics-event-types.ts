import type { AnalyticsEventType } from '@prisma/client';

const SUPPORTED_ANALYTICS_EVENT_TYPES = new Set<AnalyticsEventType>([
  'VIEW',
  'OPEN',
  'START',
  'FIELD_FOCUS',
  'FIELD_BLUR',
  'FIELD_CHANGE',
  'SUBMIT',
  'SUCCESS',
  'ERROR',
  'CLOSE',
]);

export function isSupportedAnalyticsEventType(value: string): value is AnalyticsEventType {
  return SUPPORTED_ANALYTICS_EVENT_TYPES.has(value as AnalyticsEventType);
}
