import type { AnalyticsEventMetadata } from '../types/analytics.types.js';

export function buildStoredEventMetadata(input: {
  widgetVersionId: string;
  metadata?: AnalyticsEventMetadata;
  occurredAt?: string;
}): AnalyticsEventMetadata {
  const metadata = input.metadata ?? {};

  return {
    ...metadata,
    widgetVersionId: input.widgetVersionId,
    occurredAt: input.occurredAt ?? metadata.occurredAt,
  };
}

export function extractEventTimestamp(metadata: AnalyticsEventMetadata, fallback: Date): Date {
  if (metadata.occurredAt) {
    const parsed = Date.parse(metadata.occurredAt);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  return fallback;
}
