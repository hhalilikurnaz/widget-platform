// ─── Types ───────────────────────────────────────────────────────────────────

export type WidgetStatus = 'published' | 'draft' | 'archived' | 'paused'
export type WidgetType = 'contact' | 'survey' | 'quiz' | 'popup' | 'embed' | 'chat' | 'feedback' | 'booking'

export interface Widget {
  id: string
  name: string
  type: WidgetType
  status: WidgetStatus
  views: number
  submissions: number
  conversionRate: number
  createdAt: string
  updatedAt: string
  workspace: string
  aiGenerated: boolean
  thumbnail?: string
  tags: string[]
}

export interface Submission {
  id: string
  widgetId: string
  widgetName: string
  name: string
  email: string
  company?: string
  message?: string
  score?: number
  submittedAt: string
  status: 'new' | 'read' | 'starred' | 'archived'
  source: string
  country: string
  device: 'desktop' | 'mobile' | 'tablet'
  data: Record<string, string>
}

export interface ActivityItem {
  id: string
  type: 'created' | 'published' | 'submission' | 'ai_generated' | 'template_used' | 'theme_applied' | 'settings_updated'
  message: string
  widget?: string
  timestamp: string
  user: string
  avatar: string
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  isPremium: boolean
  usageCount: number
  tags: string[]
  previewUrl?: string
}

export interface Theme {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  bgColor: string
  textColor: string
  borderRadius: string
  isPremium: boolean
  previewColors: string[]
}

// ─── Widgets ─────────────────────────────────────────────────────────────────

export const widgets: Widget[] = [
  {
    id: 'wgt_001',
    name: 'Enterprise Contact Form',
    type: 'contact',
    status: 'published',
    views: 12840,
    submissions: 1284,
    conversionRate: 10.0,
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-07-28T14:22:00Z',
    workspace: 'Acme Corp',
    aiGenerated: true,
    tags: ['sales', 'lead-gen'],
  },
  {
    id: 'wgt_002',
    name: 'Product Feedback Survey',
    type: 'survey',
    status: 'published',
    views: 8320,
    submissions: 2164,
    conversionRate: 26.0,
    createdAt: '2026-06-15T11:30:00Z',
    updatedAt: '2026-07-30T10:00:00Z',
    workspace: 'Acme Corp',
    aiGenerated: false,
    tags: ['feedback', 'product'],
  },
  {
    id: 'wgt_003',
    name: 'Onboarding Quiz',
    type: 'quiz',
    status: 'published',
    views: 5610,
    submissions: 1402,
    conversionRate: 25.0,
    createdAt: '2026-06-20T08:00:00Z',
    updatedAt: '2026-07-25T16:45:00Z',
    workspace: 'Nova Health',
    aiGenerated: true,
    tags: ['onboarding', 'user-research'],
  },
  {
    id: 'wgt_004',
    name: 'Exit Intent Popup',
    type: 'popup',
    status: 'paused',
    views: 24500,
    submissions: 490,
    conversionRate: 2.0,
    createdAt: '2026-05-01T12:00:00Z',
    updatedAt: '2026-07-01T09:00:00Z',
    workspace: 'Acme Corp',
    aiGenerated: false,
    tags: ['conversion', 'retention'],
  },
  {
    id: 'wgt_005',
    name: 'Support Chat Launcher',
    type: 'chat',
    status: 'published',
    views: 31200,
    submissions: 4368,
    conversionRate: 14.0,
    createdAt: '2026-04-15T10:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
    workspace: 'Nova Health',
    aiGenerated: false,
    tags: ['support', 'chat'],
  },
  {
    id: 'wgt_006',
    name: 'Newsletter Signup Embed',
    type: 'embed',
    status: 'published',
    views: 18900,
    submissions: 3213,
    conversionRate: 17.0,
    createdAt: '2026-05-20T14:00:00Z',
    updatedAt: '2026-07-29T11:30:00Z',
    workspace: 'Acme Corp',
    aiGenerated: true,
    tags: ['newsletter', 'marketing'],
  },
  {
    id: 'wgt_007',
    name: 'Demo Booking Form',
    type: 'booking',
    status: 'draft',
    views: 0,
    submissions: 0,
    conversionRate: 0,
    createdAt: '2026-07-31T16:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
    workspace: 'Stripe',
    aiGenerated: true,
    tags: ['sales', 'booking'],
  },
  {
    id: 'wgt_008',
    name: 'NPS Score Survey',
    type: 'survey',
    status: 'published',
    views: 6200,
    submissions: 1612,
    conversionRate: 26.0,
    createdAt: '2026-06-05T09:00:00Z',
    updatedAt: '2026-07-20T15:00:00Z',
    workspace: 'Nova Health',
    aiGenerated: false,
    tags: ['nps', 'retention'],
  },
  {
    id: 'wgt_009',
    name: 'Waitlist Collection',
    type: 'embed',
    status: 'archived',
    views: 9800,
    submissions: 2156,
    conversionRate: 22.0,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-05-30T12:00:00Z',
    workspace: 'WidgetForge Studio',
    aiGenerated: false,
    tags: ['launch', 'waitlist'],
  },
  {
    id: 'wgt_010',
    name: 'Job Application Form',
    type: 'contact',
    status: 'draft',
    views: 0,
    submissions: 0,
    conversionRate: 0,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
    workspace: 'Stripe',
    aiGenerated: false,
    tags: ['hr', 'recruiting'],
  },
  {
    id: 'wgt_011',
    name: 'Product Interest Survey',
    type: 'survey',
    status: 'published',
    views: 4200,
    submissions: 756,
    conversionRate: 18.0,
    createdAt: '2026-07-01T11:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
    workspace: 'WidgetForge Studio',
    aiGenerated: true,
    tags: ['product', 'research'],
  },
  {
    id: 'wgt_012',
    name: 'Bug Report Widget',
    type: 'feedback',
    status: 'published',
    views: 3100,
    submissions: 248,
    conversionRate: 8.0,
    createdAt: '2026-07-10T09:00:00Z',
    updatedAt: '2026-07-31T14:00:00Z',
    workspace: 'WidgetForge Studio',
    aiGenerated: false,
    tags: ['support', 'bugs'],
  },
]

// ─── Stats ────────────────────────────────────────────────────────────────────

export const dashboardStats = {
  activeWidgets: { value: 8, change: +2, changeType: 'positive' as const },
  totalPublished: { value: 8, change: +1, changeType: 'positive' as const },
  totalLeads: { value: 17_741, change: +1284, changeType: 'positive' as const },
  totalViews: { value: 124_670, change: +8300, changeType: 'positive' as const },
  conversionRate: { value: 14.2, change: +1.8, changeType: 'positive' as const },
  avgSessionTime: { value: 2.4, change: -0.2, changeType: 'negative' as const },
}

// ─── Chart Data ───────────────────────────────────────────────────────────────

export const visitorsChartData = [
  { date: 'Jul 3', views: 3200, submissions: 420 },
  { date: 'Jul 6', views: 4100, submissions: 510 },
  { date: 'Jul 9', views: 3800, submissions: 480 },
  { date: 'Jul 12', views: 5200, submissions: 680 },
  { date: 'Jul 15', views: 4700, submissions: 590 },
  { date: 'Jul 18', views: 6100, submissions: 820 },
  { date: 'Jul 21', views: 5400, submissions: 750 },
  { date: 'Jul 24', views: 7200, submissions: 960 },
  { date: 'Jul 27', views: 6800, submissions: 890 },
  { date: 'Jul 30', views: 8300, submissions: 1120 },
  { date: 'Aug 1', views: 7600, submissions: 1040 },
  { date: 'Aug 3', views: 9100, submissions: 1280 },
]

export const widgetPerformanceData = [
  { name: 'Contact Form', submissions: 1284, views: 12840 },
  { name: 'Feedback Survey', submissions: 2164, views: 8320 },
  { name: 'Support Chat', submissions: 4368, views: 31200 },
  { name: 'Newsletter', submissions: 3213, views: 18900 },
  { name: 'Onboarding Quiz', submissions: 1402, views: 5610 },
  { name: 'NPS Survey', submissions: 1612, views: 6200 },
]

export const deviceData = [
  { name: 'Desktop', value: 58, color: '#3b82f6' },
  { name: 'Mobile', value: 31, color: '#06b6d4' },
  { name: 'Tablet', value: 11, color: '#8b5cf6' },
]

export const browserData = [
  { name: 'Chrome', value: 64, color: '#3b82f6' },
  { name: 'Safari', value: 21, color: '#06b6d4' },
  { name: 'Firefox', value: 9, color: '#10b981' },
  { name: 'Edge', value: 6, color: '#f59e0b' },
]

export const geoData = [
  { country: 'United States', flag: '🇺🇸', sessions: 42_300, conversion: 12.4 },
  { country: 'United Kingdom', flag: '🇬🇧', sessions: 18_200, conversion: 14.1 },
  { country: 'Germany', flag: '🇩🇪', sessions: 11_400, conversion: 11.8 },
  { country: 'Canada', flag: '🇨🇦', sessions: 9_800, conversion: 13.2 },
  { country: 'Australia', flag: '🇦🇺', sessions: 7_600, conversion: 10.9 },
  { country: 'France', flag: '🇫🇷', sessions: 6_200, conversion: 9.7 },
  { country: 'Netherlands', flag: '🇳🇱', sessions: 5_100, conversion: 15.3 },
  { country: 'Japan', flag: '🇯🇵', sessions: 4_300, conversion: 8.2 },
]

export const funnelData = [
  { stage: 'Impressions', value: 124670, pct: 100 },
  { stage: 'Widget Opened', value: 89280, pct: 71.6 },
  { stage: 'Field Interaction', value: 41240, pct: 33.1 },
  { stage: 'Form Completed', value: 21800, pct: 17.5 },
  { stage: 'Submitted', value: 17741, pct: 14.2 },
]

// ─── Submissions ──────────────────────────────────────────────────────────────

export const submissions: Submission[] = [
  {
    id: 'sub_001',
    widgetId: 'wgt_001',
    widgetName: 'Enterprise Contact Form',
    name: 'Sarah Chen',
    email: 'sarah.chen@acmecorp.com',
    company: 'Acme Corp',
    message: "We're interested in scaling your solution across 500+ seats. Can we schedule a call this week?",
    submittedAt: '2026-08-03T10:24:00Z',
    status: 'new',
    source: 'acmecorp.com/contact',
    country: 'United States',
    device: 'desktop',
    data: { budget: '$50k+', timeline: 'Q4 2026', team_size: '500+' },
  },
  {
    id: 'sub_002',
    widgetId: 'wgt_002',
    widgetName: 'Product Feedback Survey',
    name: 'Marcus Webb',
    email: 'm.webb@novahealth.io',
    company: 'Nova Health',
    message: 'The analytics dashboard is excellent. Would love to see more AI-driven insights.',
    score: 9,
    submittedAt: '2026-08-03T09:48:00Z',
    status: 'read',
    source: 'app.novahealth.io',
    country: 'United Kingdom',
    device: 'desktop',
    data: { nps_score: '9', feature_request: 'AI insights', plan: 'Pro' },
  },
  {
    id: 'sub_003',
    widgetId: 'wgt_005',
    widgetName: 'Support Chat Launcher',
    name: 'Lena Hartmann',
    email: 'lena@berlintech.de',
    company: 'Berlin Tech GmbH',
    message: 'Having trouble with the embed script on our Next.js app. Getting CORS errors.',
    submittedAt: '2026-08-03T09:12:00Z',
    status: 'starred',
    source: 'berlintech.de',
    country: 'Germany',
    device: 'desktop',
    data: { priority: 'high', category: 'Technical', widget_version: '2.4.1' },
  },
  {
    id: 'sub_004',
    widgetId: 'wgt_006',
    widgetName: 'Newsletter Signup Embed',
    name: 'Theo Rousseau',
    email: 'theo.r@lumiere.fr',
    submittedAt: '2026-08-03T08:55:00Z',
    status: 'new',
    source: 'lumiere.fr/blog',
    country: 'France',
    device: 'mobile',
    data: { referrer: 'twitter', interests: 'design, AI', frequency: 'weekly' },
  },
  {
    id: 'sub_005',
    widgetId: 'wgt_001',
    widgetName: 'Enterprise Contact Form',
    name: 'Priya Sharma',
    email: 'priya.sharma@finbridge.in',
    company: 'FinBridge',
    message: 'Looking to embed lead capture on our investment platform. Need GDPR compliance docs.',
    submittedAt: '2026-08-02T17:30:00Z',
    status: 'read',
    source: 'finbridge.in/solutions',
    country: 'United States',
    device: 'desktop',
    data: { budget: '$10k–25k', compliance: 'GDPR, SOC2', industry: 'Finance' },
  },
  {
    id: 'sub_006',
    widgetId: 'wgt_003',
    widgetName: 'Onboarding Quiz',
    name: 'Jordan Park',
    email: 'jordan@softwave.co',
    company: 'SoftWave',
    score: 8,
    submittedAt: '2026-08-02T15:44:00Z',
    status: 'new',
    source: 'app.softwave.co/onboarding',
    country: 'Canada',
    device: 'desktop',
    data: { role: 'Developer', experience: '3-5 years', goal: 'Lead Generation' },
  },
  {
    id: 'sub_007',
    widgetId: 'wgt_008',
    widgetName: 'NPS Score Survey',
    name: 'Amelia Torres',
    email: 'amelia@digitalcraft.mx',
    score: 7,
    submittedAt: '2026-08-02T14:00:00Z',
    status: 'archived',
    source: 'digitalcraft.mx/app',
    country: 'United States',
    device: 'mobile',
    data: { nps_score: '7', reason: 'Good features, needs better mobile UX', plan: 'Starter' },
  },
  {
    id: 'sub_008',
    widgetId: 'wgt_006',
    widgetName: 'Newsletter Signup Embed',
    name: 'Oliver Schmidt',
    email: 'oliver@gruenstart.de',
    submittedAt: '2026-08-02T11:22:00Z',
    status: 'read',
    source: 'gruenstart.de',
    country: 'Germany',
    device: 'tablet',
    data: { referrer: 'linkedin', interests: 'sustainability, tech', frequency: 'monthly' },
  },
]

// ─── Activity ─────────────────────────────────────────────────────────────────

export const activityFeed: ActivityItem[] = [
  {
    id: 'act_001',
    type: 'submission',
    message: 'New submission on Enterprise Contact Form',
    widget: 'Enterprise Contact Form',
    timestamp: '2026-08-03T10:24:00Z',
    user: 'Sarah Chen',
    avatar: 'SC',
  },
  {
    id: 'act_002',
    type: 'ai_generated',
    message: 'AI generated Demo Booking Form from prompt',
    widget: 'Demo Booking Form',
    timestamp: '2026-08-03T09:30:00Z',
    user: 'You',
    avatar: 'YU',
  },
  {
    id: 'act_003',
    type: 'published',
    message: 'Bug Report Widget published to production',
    widget: 'Bug Report Widget',
    timestamp: '2026-08-03T08:15:00Z',
    user: 'You',
    avatar: 'YU',
  },
  {
    id: 'act_004',
    type: 'theme_applied',
    message: 'Applied "Midnight Blue" theme to Support Chat Launcher',
    widget: 'Support Chat Launcher',
    timestamp: '2026-08-02T16:40:00Z',
    user: 'You',
    avatar: 'YU',
  },
  {
    id: 'act_005',
    type: 'submission',
    message: '124 new submissions in the last 24 hours',
    timestamp: '2026-08-02T14:00:00Z',
    user: 'System',
    avatar: 'SY',
  },
  {
    id: 'act_006',
    type: 'template_used',
    message: 'Started from "Lead Capture Pro" template',
    widget: 'Demo Booking Form',
    timestamp: '2026-08-01T11:00:00Z',
    user: 'You',
    avatar: 'YU',
  },
  {
    id: 'act_007',
    type: 'created',
    message: 'Job Application Form created',
    widget: 'Job Application Form',
    timestamp: '2026-08-01T08:00:00Z',
    user: 'You',
    avatar: 'YU',
  },
]

// ─── Templates ────────────────────────────────────────────────────────────────

export const templates: Template[] = [
  { id: 'tpl_001', name: 'Lead Capture Pro', description: 'High-converting lead capture with progressive profiling and smart validation.', category: 'Lead Generation', thumbnail: '', isPremium: false, usageCount: 12400, tags: ['leads', 'sales', 'conversion'] },
  { id: 'tpl_002', name: 'NPS Survey Classic', description: 'Net Promoter Score survey with branching logic and detailed follow-up questions.', category: 'Surveys', thumbnail: '', isPremium: false, usageCount: 9800, tags: ['nps', 'feedback', 'retention'] },
  { id: 'tpl_003', name: 'Product Onboarding Quiz', description: 'Segment new users by role, goal, and experience for personalized onboarding flows.', category: 'Onboarding', thumbnail: '', isPremium: true, usageCount: 6200, tags: ['onboarding', 'segmentation'] },
  { id: 'tpl_004', name: 'Exit Intent Popup', description: 'Recapture abandoning visitors with a targeted offer triggered by exit intent.', category: 'Popups', thumbnail: '', isPremium: false, usageCount: 18700, tags: ['retention', 'conversion', 'popup'] },
  { id: 'tpl_005', name: 'Customer Satisfaction (CSAT)', description: 'Quick one-question satisfaction survey embeddable anywhere on your site.', category: 'Surveys', thumbnail: '', isPremium: false, usageCount: 7400, tags: ['csat', 'satisfaction', 'feedback'] },
  { id: 'tpl_006', name: 'Demo Booking Form', description: 'Streamlined demo scheduling with timezone detection and calendar integration.', category: 'Booking', thumbnail: '', isPremium: true, usageCount: 4100, tags: ['booking', 'sales', 'calendar'] },
  { id: 'tpl_007', name: 'Newsletter Subscribe', description: 'Minimal, high-converting newsletter signup with double opt-in and preference center.', category: 'Marketing', thumbnail: '', isPremium: false, usageCount: 22300, tags: ['newsletter', 'email', 'marketing'] },
  { id: 'tpl_008', name: 'Bug Report Form', description: 'Developer-focused bug report form with file attachment, steps-to-reproduce, and severity.', category: 'Support', thumbnail: '', isPremium: false, usageCount: 3800, tags: ['support', 'bugs', 'developer'] },
  { id: 'tpl_009', name: 'Feature Voting Widget', description: 'Let users vote on upcoming features and add comments. Great for product roadmap.', category: 'Feedback', thumbnail: '', isPremium: true, usageCount: 2900, tags: ['product', 'voting', 'roadmap'] },
  { id: 'tpl_010', name: 'Job Application', description: 'Full-featured job application form with resume upload, cover letter, and custom questions.', category: 'HR', thumbnail: '', isPremium: false, usageCount: 5100, tags: ['hr', 'recruiting', 'jobs'] },
  { id: 'tpl_011', name: 'Event RSVP', description: 'Event registration form with dietary preferences, plus-ones, and confirmation emails.', category: 'Events', thumbnail: '', isPremium: false, usageCount: 8200, tags: ['events', 'rsvp', 'registration'] },
  { id: 'tpl_012', name: 'Product Feedback Loop', description: 'Multi-step feedback collection with in-app triggering, analytics, and AI analysis.', category: 'Feedback', thumbnail: '', isPremium: true, usageCount: 3400, tags: ['product', 'feedback', 'ai'] },
]

export const templateCategories = ['All', 'Lead Generation', 'Surveys', 'Onboarding', 'Popups', 'Marketing', 'Support', 'Feedback', 'Booking', 'HR', 'Events']

// ─── Themes ───────────────────────────────────────────────────────────────────

export const themes: Theme[] = [
  { id: 'thm_001', name: 'Midnight Blue', primaryColor: '#3b82f6', secondaryColor: '#1d4ed8', bgColor: '#0f172a', textColor: '#f8fafc', borderRadius: '8px', isPremium: false, previewColors: ['#0f172a', '#1e293b', '#3b82f6', '#f8fafc'] },
  { id: 'thm_002', name: 'Pure Light', primaryColor: '#2563eb', secondaryColor: '#3b82f6', bgColor: '#ffffff', textColor: '#0f172a', borderRadius: '8px', isPremium: false, previewColors: ['#ffffff', '#f8fafc', '#2563eb', '#0f172a'] },
  { id: 'thm_003', name: 'Forest Green', primaryColor: '#10b981', secondaryColor: '#059669', bgColor: '#064e3b', textColor: '#ecfdf5', borderRadius: '12px', isPremium: false, previewColors: ['#064e3b', '#065f46', '#10b981', '#ecfdf5'] },
  { id: 'thm_004', name: 'Sunset Orange', primaryColor: '#f97316', secondaryColor: '#ea580c', bgColor: '#1c1917', textColor: '#fafaf9', borderRadius: '6px', isPremium: true, previewColors: ['#1c1917', '#292524', '#f97316', '#fafaf9'] },
  { id: 'thm_005', name: 'Rose Quartz', primaryColor: '#f43f5e', secondaryColor: '#e11d48', bgColor: '#fff1f2', textColor: '#0f172a', borderRadius: '16px', isPremium: false, previewColors: ['#fff1f2', '#ffe4e6', '#f43f5e', '#0f172a'] },
  { id: 'thm_006', name: 'Cyberpunk', primaryColor: '#a855f7', secondaryColor: '#06b6d4', bgColor: '#09090b', textColor: '#fafafa', borderRadius: '4px', isPremium: true, previewColors: ['#09090b', '#18181b', '#a855f7', '#06b6d4'] },
  { id: 'thm_007', name: 'Sand Dune', primaryColor: '#d97706', secondaryColor: '#b45309', bgColor: '#fef3c7', textColor: '#1c1917', borderRadius: '10px', isPremium: false, previewColors: ['#fef3c7', '#fde68a', '#d97706', '#1c1917'] },
  { id: 'thm_008', name: 'Ocean Deep', primaryColor: '#0891b2', secondaryColor: '#0e7490', bgColor: '#082f49', textColor: '#e0f7fa', borderRadius: '8px', isPremium: true, previewColors: ['#082f49', '#0c4a6e', '#0891b2', '#e0f7fa'] },
  { id: 'thm_009', name: 'Slate Minimal', primaryColor: '#6366f1', secondaryColor: '#4f46e5', bgColor: '#f8fafc', textColor: '#0f172a', borderRadius: '6px', isPremium: false, previewColors: ['#f8fafc', '#f1f5f9', '#6366f1', '#0f172a'] },
  { id: 'thm_010', name: 'Terminal', primaryColor: '#22c55e', secondaryColor: '#16a34a', bgColor: '#0a0a0a', textColor: '#f0fdf4', borderRadius: '2px', isPremium: true, previewColors: ['#0a0a0a', '#141414', '#22c55e', '#f0fdf4'] },
]

// ─── Alias exports (used by pages) ───────────────────────────────────────────

export const mockWidgets = widgets

// Rich submission records with extra metadata fields pages need
export interface RichSubmission {
  id: string
  widgetId: string
  widgetName: string
  name: string
  email: string
  company?: string
  message?: string
  score?: number
  createdAt: string
  status: 'new' | 'read' | 'starred' | 'archived'
  pageUrl: string
  country: string
  device: 'desktop' | 'mobile' | 'tablet'
  ip?: string
  userAgent?: string
  referrer?: string
  fields: Record<string, string>
}

export const mockSubmissions: RichSubmission[] = [
  {
    id: 'sub_001',
    widgetId: 'wgt_001',
    widgetName: 'Enterprise Contact Form',
    name: 'Sarah Chen',
    email: 'sarah.chen@acmecorp.com',
    company: 'Acme Corp',
    message: "We're interested in scaling your solution across 500+ seats. Can we schedule a call this week?",
    createdAt: '2026-08-03T10:24:00Z',
    status: 'new',
    pageUrl: 'acmecorp.com/contact',
    country: 'United States',
    device: 'desktop',
    ip: '185.22.14.101',
    userAgent: 'Chrome 124, macOS',
    referrer: 'google.com',
    fields: { budget: '$50k+', timeline: 'Q4 2026', team_size: '500+' },
  },
  {
    id: 'sub_002',
    widgetId: 'wgt_002',
    widgetName: 'Product Feedback Survey',
    name: 'Marcus Webb',
    email: 'm.webb@novahealth.io',
    company: 'Nova Health',
    message: 'The analytics dashboard is excellent. Would love to see more AI-driven insights.',
    score: 9,
    createdAt: '2026-08-03T09:48:00Z',
    status: 'read',
    pageUrl: 'app.novahealth.io',
    country: 'United Kingdom',
    device: 'desktop',
    ip: '91.104.12.55',
    userAgent: 'Safari 17, macOS',
    referrer: '—',
    fields: { nps_score: '9', feature_request: 'AI insights', plan: 'Pro' },
  },
  {
    id: 'sub_003',
    widgetId: 'wgt_005',
    widgetName: 'Support Chat Launcher',
    name: 'Lena Hartmann',
    email: 'lena@berlintech.de',
    company: 'Berlin Tech GmbH',
    message: 'Having trouble with the embed script on our Next.js app. Getting CORS errors.',
    createdAt: '2026-08-03T09:12:00Z',
    status: 'starred',
    pageUrl: 'berlintech.de/app',
    country: 'Germany',
    device: 'desktop',
    ip: '78.66.102.14',
    userAgent: 'Firefox 125, Windows',
    referrer: '—',
    fields: { priority: 'high', category: 'Technical', widget_version: '2.4.1' },
  },
  {
    id: 'sub_004',
    widgetId: 'wgt_006',
    widgetName: 'Newsletter Signup Embed',
    name: 'Theo Rousseau',
    email: 'theo.r@lumiere.fr',
    createdAt: '2026-08-03T08:55:00Z',
    status: 'new',
    pageUrl: 'lumiere.fr/blog',
    country: 'France',
    device: 'mobile',
    ip: '90.112.44.23',
    userAgent: 'Safari 17, iOS',
    referrer: 'twitter.com',
    fields: { referrer: 'twitter', interests: 'design, AI', frequency: 'weekly' },
  },
  {
    id: 'sub_005',
    widgetId: 'wgt_001',
    widgetName: 'Enterprise Contact Form',
    name: 'Priya Sharma',
    email: 'priya.sharma@finbridge.in',
    company: 'FinBridge',
    message: 'Looking to embed lead capture on our investment platform. Need GDPR compliance docs.',
    createdAt: '2026-08-02T17:30:00Z',
    status: 'read',
    pageUrl: 'finbridge.in/solutions',
    country: 'United States',
    device: 'desktop',
    ip: '12.34.56.78',
    userAgent: 'Chrome 124, Windows',
    referrer: 'linkedin.com',
    fields: { budget: '$10k–25k', compliance: 'GDPR, SOC2', industry: 'Finance' },
  },
  {
    id: 'sub_006',
    widgetId: 'wgt_003',
    widgetName: 'Onboarding Quiz',
    name: 'Jordan Park',
    email: 'jordan@softwave.co',
    company: 'SoftWave',
    score: 8,
    createdAt: '2026-08-02T15:44:00Z',
    status: 'new',
    pageUrl: 'app.softwave.co/onboarding',
    country: 'Canada',
    device: 'desktop',
    ip: '142.55.88.12',
    userAgent: 'Chrome 124, macOS',
    referrer: 'producthunt.com',
    fields: { role: 'Developer', experience: '3-5 years', goal: 'Lead Generation' },
  },
  {
    id: 'sub_007',
    widgetId: 'wgt_008',
    widgetName: 'NPS Score Survey',
    name: 'Amelia Torres',
    email: 'amelia@digitalcraft.mx',
    score: 7,
    createdAt: '2026-08-02T14:00:00Z',
    status: 'archived',
    pageUrl: 'digitalcraft.mx/app',
    country: 'United States',
    device: 'mobile',
    ip: '66.102.77.23',
    userAgent: 'Chrome 124, Android',
    referrer: '—',
    fields: { nps_score: '7', reason: 'Good features, needs better mobile UX', plan: 'Starter' },
  },
  {
    id: 'sub_008',
    widgetId: 'wgt_006',
    widgetName: 'Newsletter Signup Embed',
    name: 'Oliver Schmidt',
    email: 'oliver@gruenstart.de',
    createdAt: '2026-08-02T11:22:00Z',
    status: 'read',
    pageUrl: 'gruenstart.de',
    country: 'Germany',
    device: 'tablet',
    ip: '78.55.34.91',
    userAgent: 'Safari 17, iPadOS',
    referrer: 'linkedin.com',
    fields: { referrer: 'linkedin', interests: 'sustainability, tech', frequency: 'monthly' },
  },
]

// Rich template records with extra fields pages need
export interface RichTemplate {
  id: string
  name: string
  description: string
  category: string
  type: string
  isPremium: boolean
  usageCount: number
  uses: number
  tags: string[]
  rating: number
  author: string
  accentColor: string
  buttonText: string
}

export const mockTemplates: RichTemplate[] = [
  { id: 'tpl_001', name: 'Lead Capture Pro', description: 'High-converting lead capture with progressive profiling and smart validation.', category: 'Lead Generation', type: 'contact', isPremium: false, usageCount: 12400, uses: 12400, tags: ['leads', 'sales'], rating: 4.8, author: 'WidgetForge', accentColor: '#3b82f6', buttonText: 'Get Started' },
  { id: 'tpl_002', name: 'NPS Survey Classic', description: 'Net Promoter Score survey with branching logic and detailed follow-up questions.', category: 'Surveys', type: 'survey', isPremium: false, usageCount: 9800, uses: 9800, tags: ['nps', 'feedback'], rating: 4.7, author: 'WidgetForge', accentColor: '#8b5cf6', buttonText: 'Submit Score' },
  { id: 'tpl_003', name: 'Product Onboarding Quiz', description: 'Segment new users by role, goal, and experience for personalised onboarding.', category: 'Onboarding', type: 'quiz', isPremium: true, usageCount: 6200, uses: 6200, tags: ['onboarding', 'quiz'], rating: 4.9, author: 'ProWidgets', accentColor: '#06b6d4', buttonText: 'Start Quiz' },
  { id: 'tpl_004', name: 'Exit Intent Popup', description: 'Recapture abandoning visitors with a targeted offer triggered by exit intent.', category: 'Popups', type: 'popup', isPremium: false, usageCount: 18700, uses: 18700, tags: ['retention', 'popup'], rating: 4.6, author: 'WidgetForge', accentColor: '#f43f5e', buttonText: 'Claim Offer' },
  { id: 'tpl_005', name: 'CSAT One-Click', description: 'Quick one-question satisfaction survey embeddable anywhere on your site.', category: 'Surveys', type: 'feedback', isPremium: false, usageCount: 7400, uses: 7400, tags: ['csat', 'feedback'], rating: 4.5, author: 'WidgetForge', accentColor: '#10b981', buttonText: 'Rate Us' },
  { id: 'tpl_006', name: 'Demo Booking Form', description: 'Streamlined demo scheduling with timezone detection and calendar integration.', category: 'Booking', type: 'booking', isPremium: true, usageCount: 4100, uses: 4100, tags: ['booking', 'sales'], rating: 4.8, author: 'SalesKit', accentColor: '#f59e0b', buttonText: 'Book Demo' },
  { id: 'tpl_007', name: 'Newsletter Subscribe', description: 'Minimal, high-converting newsletter signup with double opt-in and preference centre.', category: 'Marketing', type: 'embed', isPremium: false, usageCount: 22300, uses: 22300, tags: ['newsletter', 'email'], rating: 4.7, author: 'WidgetForge', accentColor: '#3b82f6', buttonText: 'Subscribe' },
  { id: 'tpl_008', name: 'Bug Report Form', description: 'Developer-focused bug report with file attachment, steps-to-reproduce, and severity.', category: 'Support', type: 'feedback', isPremium: false, usageCount: 3800, uses: 3800, tags: ['support', 'bugs'], rating: 4.4, author: 'DevTools', accentColor: '#ef4444', buttonText: 'Submit Bug' },
  { id: 'tpl_009', name: 'Feature Voting Widget', description: 'Let users vote on upcoming features and add comments for your product roadmap.', category: 'Feedback', type: 'feedback', isPremium: true, usageCount: 2900, uses: 2900, tags: ['product', 'voting'], rating: 4.6, author: 'ProWidgets', accentColor: '#8b5cf6', buttonText: 'Cast Vote' },
  { id: 'tpl_010', name: 'Job Application', description: 'Full-featured application form with resume upload and custom screening questions.', category: 'HR', type: 'contact', isPremium: false, usageCount: 5100, uses: 5100, tags: ['hr', 'recruiting'], rating: 4.3, author: 'WidgetForge', accentColor: '#64748b', buttonText: 'Apply Now' },
  { id: 'tpl_011', name: 'Event RSVP', description: 'Event registration with dietary preferences, plus-ones, and confirmation emails.', category: 'Events', type: 'contact', isPremium: false, usageCount: 8200, uses: 8200, tags: ['events', 'rsvp'], rating: 4.5, author: 'EventKit', accentColor: '#ec4899', buttonText: 'RSVP Now' },
  { id: 'tpl_012', name: 'Product Feedback Loop', description: 'Multi-step feedback collection with in-app triggering, analytics, and AI analysis.', category: 'Feedback', type: 'feedback', isPremium: true, usageCount: 3400, uses: 3400, tags: ['product', 'ai'], rating: 4.8, author: 'AIWidgets', accentColor: '#06b6d4', buttonText: 'Send Feedback' },
]

// Rich theme records with extra fields pages need
export interface RichTheme {
  id: string
  name: string
  description: string
  colors: string[]
  fontHeading: string
  fontBody: string
  borderRadius: number
  isPremium: boolean
  isActive: boolean
}

export const mockThemes: RichTheme[] = [
  { id: 'thm_001', name: 'Midnight Blue', description: 'Deep navy and electric blue — sharp, professional.', colors: ['#3b82f6', '#1d4ed8', '#0f172a', '#1e293b'], fontHeading: 'Inter', fontBody: 'Inter', borderRadius: 8, isPremium: false, isActive: true },
  { id: 'thm_002', name: 'Pure Light', description: 'Clean white background with bold blue accents.', colors: ['#2563eb', '#3b82f6', '#ffffff', '#f8fafc'], fontHeading: 'Inter', fontBody: 'Inter', borderRadius: 8, isPremium: false, isActive: false },
  { id: 'thm_003', name: 'Forest Green', description: 'Rich greens for wellness and sustainability brands.', colors: ['#10b981', '#059669', '#064e3b', '#ecfdf5'], fontHeading: 'Inter', fontBody: 'Inter', borderRadius: 12, isPremium: false, isActive: false },
  { id: 'thm_004', name: 'Sunset Orange', description: 'Warm amber tones — energetic and bold.', colors: ['#f97316', '#ea580c', '#1c1917', '#fafaf9'], fontHeading: 'Inter', fontBody: 'Inter', borderRadius: 6, isPremium: true, isActive: false },
  { id: 'thm_005', name: 'Rose Quartz', description: 'Soft pink on white — elegant and modern.', colors: ['#f43f5e', '#e11d48', '#fff1f2', '#0f172a'], fontHeading: 'Inter', fontBody: 'Inter', borderRadius: 16, isPremium: false, isActive: false },
  { id: 'thm_006', name: 'Cyberpunk', description: 'Electric purple and cyan on near-black.', colors: ['#a855f7', '#06b6d4', '#09090b', '#18181b'], fontHeading: 'Inter', fontBody: 'Inter', borderRadius: 4, isPremium: true, isActive: false },
  { id: 'thm_007', name: 'Sand Dune', description: 'Warm amber on parchment for a premium feel.', colors: ['#d97706', '#b45309', '#fef3c7', '#1c1917'], fontHeading: 'Inter', fontBody: 'Inter', borderRadius: 10, isPremium: false, isActive: false },
  { id: 'thm_008', name: 'Ocean Deep', description: 'Teal on deep blue — calm and trustworthy.', colors: ['#0891b2', '#0e7490', '#082f49', '#e0f7fa'], fontHeading: 'Inter', fontBody: 'Inter', borderRadius: 8, isPremium: true, isActive: false },
  { id: 'thm_009', name: 'Slate Minimal', description: 'Indigo on light grey — minimal and sharp.', colors: ['#6366f1', '#4f46e5', '#f8fafc', '#0f172a'], fontHeading: 'Inter', fontBody: 'Inter', borderRadius: 6, isPremium: false, isActive: false },
  { id: 'thm_010', name: 'Terminal', description: 'Monospace green on black — developer aesthetic.', colors: ['#22c55e', '#16a34a', '#0a0a0a', '#f0fdf4'], fontHeading: 'monospace', fontBody: 'monospace', borderRadius: 2, isPremium: true, isActive: false },
]

// Analytics mock data
export const mockAnalytics = {
  totalImpressions: 124670,
  totalClicks: 89280,
  avgConversion: 14.2,
  daily: [
    { date: 'Jul 3', impressions: 3200, conversions: 420 },
    { date: 'Jul 6', impressions: 4100, conversions: 510 },
    { date: 'Jul 9', impressions: 3800, conversions: 480 },
    { date: 'Jul 12', impressions: 5200, conversions: 680 },
    { date: 'Jul 15', impressions: 4700, conversions: 590 },
    { date: 'Jul 18', impressions: 6100, conversions: 820 },
    { date: 'Jul 21', impressions: 5400, conversions: 750 },
    { date: 'Jul 24', impressions: 7200, conversions: 960 },
    { date: 'Jul 27', impressions: 6800, conversions: 890 },
    { date: 'Jul 30', impressions: 8300, conversions: 1120 },
    { date: 'Aug 1', impressions: 7600, conversions: 1040 },
    { date: 'Aug 3', impressions: 9100, conversions: 1280 },
  ],
  topWidgets: [
    { id: 'wgt_005', name: 'Support Chat Launcher', conversion: 14.0, change: 2.1 },
    { id: 'wgt_006', name: 'Newsletter Signup Embed', conversion: 17.0, change: 3.4 },
    { id: 'wgt_002', name: 'Product Feedback Survey', conversion: 26.0, change: 1.2 },
    { id: 'wgt_008', name: 'NPS Score Survey', conversion: 26.0, change: -0.8 },
    { id: 'wgt_001', name: 'Enterprise Contact Form', conversion: 10.0, change: 0.5 },
  ],
  funnel: [
    { stage: 'Impressions', users: 124670 },
    { stage: 'Widget Opened', users: 89280 },
    { stage: 'Field Interaction', users: 41240 },
    { stage: 'Form Completed', users: 21800 },
    { stage: 'Submitted', users: 17741 },
  ],
}
