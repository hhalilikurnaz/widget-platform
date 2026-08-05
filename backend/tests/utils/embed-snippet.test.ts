import { describe, expect, it } from 'vitest';

import { generateEmbedSnippet } from '../../src/utils/embed-snippet.js';

describe('generateEmbedSnippet', () => {
  it('generates WidgetPlatform.init snippet', () => {
    const snippet = generateEmbedSnippet('wt_0123456789abcdef0123456789abcdef');

    expect(snippet).toContain('https://cdn.widgetplatform.com/widget.js');
    expect(snippet).toContain('WidgetPlatform.init');
    expect(snippet).toContain('wt_0123456789abcdef0123456789abcdef');
  });
});
