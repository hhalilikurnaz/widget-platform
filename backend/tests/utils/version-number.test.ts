import { describe, expect, it } from 'vitest';

import { getNextVersionNumber, formatVersionLabel } from '../../src/utils/version-number.js';

describe('version-number', () => {
  it('increments from the current max version', () => {
    expect(getNextVersionNumber(3)).toBe(4);
    expect(getNextVersionNumber(null)).toBe(1);
    expect(getNextVersionNumber(undefined)).toBe(1);
  });

  it('formats version labels', () => {
    expect(formatVersionLabel(1)).toBe('v1');
    expect(formatVersionLabel(12)).toBe('v12');
  });
});
