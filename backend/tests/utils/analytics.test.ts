import { describe, expect, it } from 'vitest';

import {
  calculateBounceRate,
  calculateCompletionRate,
  calculateConversionRate,
  toAnalyticsOverview,
  toCountryBreakdown,
  toDeviceBreakdown,
  toSourceBreakdown,
} from '../../src/utils/analytics-aggregator.js';
import { classifyTrafficSource, normalizeBrowserName } from '../../src/utils/analytics-filter.js';
import { formatTimelinePeriod } from '../../src/utils/timeline.js';

describe('analytics aggregation', () => {
  it('calculates conversion and completion rates', () => {
    expect(calculateConversionRate(25, 100)).toBe(25);
    expect(calculateCompletionRate(20, 40)).toBe(50);
    expect(calculateBounceRate(30, 100)).toBe(30);
    expect(calculateConversionRate(0, 0)).toBe(0);
  });

  it('maps overview metrics from raw counts', () => {
    const overview = toAnalyticsOverview(
      {
        views: 100,
        uniqueVisitors: 80,
        opens: 60,
        starts: 40,
        submissions: 20,
        successes: 18,
        errors: 2,
        averageCompletionTimeMs: 1500,
        bouncedSessions: 25,
        totalViewSessions: 100,
      },
      new Date('2026-01-01T00:00:00.000Z'),
      new Date('2026-01-31T00:00:00.000Z'),
    );

    expect(overview.conversionRate).toBe(20);
    expect(overview.completionRate).toBe(45);
    expect(overview.bounceRate).toBe(25);
    expect(overview.averageCompletionTimeMs).toBe(1500);
  });

  it('aggregates device and country breakdowns', () => {
    const devices = toDeviceBreakdown([
      { device: 'desktop', count: 50 },
      { device: 'mobile', count: 30 },
      { device: null, count: 5 },
    ]);

    expect(devices.desktop).toBe(50);
    expect(devices.mobile).toBe(30);
    expect(devices.unknown).toBe(5);
    expect(devices.total).toBe(85);

    const countries = toCountryBreakdown([
      { country: 'US', count: 60 },
      { country: 'DE', count: 40 },
    ]);

    expect(countries.total).toBe(100);
    expect(countries.items[0]?.country).toBe('US');
    expect(countries.items[0]?.percentage).toBe(60);
  });

  it('classifies traffic sources', () => {
    expect(classifyTrafficSource({ referrer: '' })).toBe('direct');
    expect(classifyTrafficSource({ referrer: 'https://www.google.com/search?q=test' })).toBe('organic');
    expect(classifyTrafficSource({ pageUrl: 'https://example.com?utm_campaign=spring' })).toBe('campaign');
    expect(classifyTrafficSource({ referrer: 'https://news.example.com/article' })).toBe('referral');
  });

  it('aggregates source breakdown from raw rows', () => {
    const sources = toSourceBreakdown([
      { referrer: '', pageUrl: null, source: null, count: 10 },
      { referrer: 'https://google.com', pageUrl: null, source: null, count: 20 },
      { referrer: 'https://partner.com', pageUrl: null, source: null, count: 5 },
    ]);

    expect(sources.direct).toBe(10);
    expect(sources.organic).toBe(20);
    expect(sources.referral).toBe(5);
  });

  it('normalizes browser names and timeline periods', () => {
    expect(normalizeBrowserName('Chrome 120')).toBe('chrome');
    expect(normalizeBrowserName('Mobile Safari')).toBe('safari');
    expect(formatTimelinePeriod(new Date('2026-08-05T14:30:00.000Z'), 'hour')).toBe('2026-08-05T14:00:00.000Z');
    expect(formatTimelinePeriod(new Date('2026-08-05T14:30:00.000Z'), 'day')).toBe('2026-08-05');
  });
});
