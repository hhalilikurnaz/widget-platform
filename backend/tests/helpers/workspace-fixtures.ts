export const TEST_WORKSPACE_ID = '22222222-2222-2222-2222-222222222222';

export const baseWidgetRecord = {
  id: 'widget-1',
  workspaceId: TEST_WORKSPACE_ID,
  name: 'Contact Us',
  slug: 'contact-us',
  status: 'DRAFT' as const,
  description: 'Primary contact form',
  embedToken: 'wt_demo1234567890abcdef',
  themeId: null,
  createdBy: 'user-1',
  currentVersionId: 'version-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  publishedAt: null,
  deletedAt: null,
};
