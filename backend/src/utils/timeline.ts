import type { TimelineGranularity } from '../types/analytics.types.js';

export function getTimelineTruncUnit(granularity: TimelineGranularity): 'hour' | 'day' | 'week' | 'month' {
  return granularity;
}

export function formatTimelinePeriod(date: Date, granularity: TimelineGranularity): string {
  if (granularity === 'hour') {
    return date.toISOString().slice(0, 13) + ':00:00.000Z';
  }

  if (granularity === 'day') {
    return date.toISOString().slice(0, 10);
  }

  if (granularity === 'week') {
    return date.toISOString().slice(0, 10);
  }

  return `${String(date.getUTCFullYear())}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function buildEmptyTimeline(
  dateFrom: Date,
  dateTo: Date,
  granularity: TimelineGranularity,
): Date[] {
  const buckets: Date[] = [];
  const cursor = new Date(dateFrom);

  while (cursor <= dateTo) {
    buckets.push(new Date(cursor));

    if (granularity === 'hour') {
      cursor.setUTCHours(cursor.getUTCHours() + 1);
    } else if (granularity === 'day') {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    } else if (granularity === 'week') {
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    } else {
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  }

  return buckets;
}
