import {
  AnalyticsEventType,
  MembershipRole,
  PrismaClient,
  TemplateCategory,
  WidgetStatus,
  WorkspacePlan,
} from '@prisma/client';

const prisma = new PrismaClient();

const minimalThemeJson = {
  colors: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    primary: '#2563EB',
    secondary: '#64748B',
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingSize: '1.5rem',
    bodySize: '1rem',
    labelSize: '0.875rem',
  },
  spacing: { unit: 8, padding: '24px', gap: '16px' },
  borderRadius: { small: '6px', medium: '10px', large: '16px' },
  shadows: {
    small: '0 1px 2px rgba(15, 23, 42, 0.06)',
    medium: '0 8px 24px rgba(15, 23, 42, 0.08)',
    large: '0 16px 40px rgba(15, 23, 42, 0.12)',
  },
};

function contactFormSchema(title: string, subtitle: string) {
  return {
    version: 1,
    metadata: { name: title, type: 'CONTACT', description: subtitle },
    content: { title, subtitle },
    components: [
      {
        id: 'field-name',
        type: 'field',
        properties: { label: 'Full Name', fieldType: 'text', required: true, placeholder: 'Jane Smith' },
      },
      {
        id: 'field-email',
        type: 'field',
        properties: {
          label: 'Work Email',
          fieldType: 'email',
          required: true,
          placeholder: 'jane@company.com',
        },
      },
      {
        id: 'field-message',
        type: 'field',
        properties: {
          label: 'How can we help?',
          fieldType: 'textarea',
          required: true,
          placeholder: 'Tell us about your project goals…',
        },
      },
      {
        id: 'submit-button',
        type: 'button',
        properties: { label: 'Send Message', variant: 'primary' },
      },
    ],
    behavior: { submitAction: 'show_success' },
    triggers: { type: 'floating_button', label: 'Contact Us' },
  };
}

async function main(): Promise<void> {
  console.log('Seeding Widget Platform database…');

  await prisma.analyticsEvent.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.widgetVersion.deleteMany();
  await prisma.widget.deleteMany();
  await prisma.template.deleteMany();
  await prisma.theme.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Bright Smile Dental',
      slug: 'bright-smile-dental',
      logoUrl: 'https://cdn.widgetplatform.dev/demo/bright-smile-logo.svg',
      plan: WorkspacePlan.PRO,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'sarah.chen@brightsmile.dental',
      fullName: 'Sarah Chen',
      avatarUrl: 'https://cdn.widgetplatform.dev/demo/avatars/sarah-chen.jpg',
    },
  });

  await prisma.membership.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: MembershipRole.OWNER,
    },
  });

  const [corporateTheme, modernTheme, minimalTheme] = await Promise.all([
    prisma.theme.create({
      data: {
        workspaceId: workspace.id,
        name: 'Corporate Blue',
        isDefault: true,
        themeJson: {
          ...minimalThemeJson,
          colors: { ...minimalThemeJson.colors, primary: '#1D4ED8', surface: '#EFF6FF' },
        },
      },
    }),
    prisma.theme.create({
      data: {
        workspaceId: workspace.id,
        name: 'Modern Teal',
        isDefault: false,
        themeJson: {
          ...minimalThemeJson,
          colors: { ...minimalThemeJson.colors, primary: '#0D9488', surface: '#F0FDFA' },
        },
      },
    }),
    prisma.theme.create({
      data: {
        workspaceId: workspace.id,
        name: 'Clean Minimal',
        isDefault: false,
        themeJson: minimalThemeJson,
      },
    }),
  ]);

  const templates = await Promise.all([
    prisma.template.create({
      data: {
        category: TemplateCategory.HEALTHCARE,
        name: 'Dental Consultation Request',
        description: 'Capture appointment requests with name, phone, and preferred visit date.',
        previewImage: 'https://cdn.widgetplatform.dev/templates/dental-consultation.png',
        featured: true,
        schemaJson: contactFormSchema(
          'Schedule Your Consultation',
          'Our team responds within one business day.',
        ),
      },
    }),
    prisma.template.create({
      data: {
        category: TemplateCategory.LEAD_GENERATION,
        name: 'Product Demo Request',
        description: 'Qualify inbound leads with company size and use-case fields.',
        previewImage: 'https://cdn.widgetplatform.dev/templates/product-demo.png',
        featured: true,
        schemaJson: contactFormSchema('Book a Product Demo', 'See how Widget Platform fits your workflow.'),
      },
    }),
    prisma.template.create({
      data: {
        category: TemplateCategory.NEWSLETTER,
        name: 'Weekly Insights Signup',
        description: 'Grow your mailing list with a single email field and consent checkbox.',
        previewImage: 'https://cdn.widgetplatform.dev/templates/newsletter.png',
        featured: false,
        schemaJson: {
          version: 1,
          metadata: { name: 'Newsletter Signup', type: 'NEWSLETTER' },
          content: { title: 'Get Weekly Growth Tips', subtitle: 'Join 12,000+ operators.' },
          components: [
            {
              id: 'field-email',
              type: 'field',
              properties: { label: 'Email', fieldType: 'email', required: true },
            },
            {
              id: 'submit-button',
              type: 'button',
              properties: { label: 'Subscribe', variant: 'primary' },
            },
          ],
        },
      },
    }),
    prisma.template.create({
      data: {
        category: TemplateCategory.FEEDBACK,
        name: 'Post-Visit Feedback',
        description: 'Collect patient satisfaction scores after appointments.',
        previewImage: 'https://cdn.widgetplatform.dev/templates/feedback.png',
        featured: false,
        schemaJson: contactFormSchema('How was your visit?', 'Your feedback helps us improve patient care.'),
      },
    }),
    prisma.template.create({
      data: {
        category: TemplateCategory.SUPPORT,
        name: 'Support Ticket Intake',
        description: 'Route customer issues with priority and category selectors.',
        previewImage: 'https://cdn.widgetplatform.dev/templates/support.png',
        featured: true,
        schemaJson: contactFormSchema('Contact Support', 'We typically reply in under 4 hours.'),
      },
    }),
    prisma.template.create({
      data: {
        category: TemplateCategory.APPOINTMENT,
        name: 'Salon Appointment Booking',
        description: 'Let clients choose service type and preferred time window.',
        previewImage: 'https://cdn.widgetplatform.dev/templates/appointment.png',
        featured: false,
        schemaJson: contactFormSchema('Book an Appointment', 'Pick a service and we will confirm by SMS.'),
      },
    }),
    prisma.template.create({
      data: {
        category: TemplateCategory.SAAS,
        name: 'Startup Waitlist',
        description: 'Build launch momentum with role and company capture fields.',
        previewImage: 'https://cdn.widgetplatform.dev/templates/waitlist.png',
        featured: true,
        schemaJson: contactFormSchema('Join the Waitlist', 'Early access opens next month.'),
      },
    }),
    prisma.template.create({
      data: {
        category: TemplateCategory.ECOMMERCE,
        name: 'Back-in-Stock Alert',
        description: 'Notify shoppers when a product returns to inventory.',
        previewImage: 'https://cdn.widgetplatform.dev/templates/back-in-stock.png',
        featured: false,
        schemaJson: {
          version: 1,
          metadata: { name: 'Back in Stock', type: 'LEAD_FORM' },
          content: { title: 'Notify Me When Available', subtitle: 'We will email you once this item returns.' },
          components: [
            {
              id: 'field-email',
              type: 'field',
              properties: { label: 'Email', fieldType: 'email', required: true },
            },
            {
              id: 'submit-button',
              type: 'button',
              properties: { label: 'Notify Me', variant: 'primary' },
            },
          ],
        },
      },
    }),
  ]);

  const publishedAt = new Date('2026-07-15T09:00:00.000Z');

  const contactWidget = await prisma.widget.create({
    data: {
      workspaceId: workspace.id,
      name: 'Contact Us',
      slug: 'contact-us',
      description: 'Primary contact form embedded on the clinic homepage.',
      status: WidgetStatus.PUBLISHED,
      embedToken: 'wt_demo_contact_brightsmile',
      themeId: corporateTheme.id,
      createdBy: user.id,
      publishedAt,
    },
  });

  const contactV1 = await prisma.widgetVersion.create({
    data: {
      widgetId: contactWidget.id,
      version: 1,
      schemaJson: contactFormSchema(
        'Contact Bright Smile Dental',
        'Ask about cleanings, whitening, or emergency visits.',
      ),
      published: true,
      publishedAt,
    },
  });

  await prisma.widget.update({
    where: { id: contactWidget.id },
    data: { currentVersionId: contactV1.id },
  });

  const newsletterWidget = await prisma.widget.create({
    data: {
      workspaceId: workspace.id,
      name: 'Oral Health Newsletter',
      slug: 'oral-health-newsletter',
      description: 'Sidebar signup widget for monthly patient education emails.',
      status: WidgetStatus.DRAFT,
      themeId: modernTheme.id,
      createdBy: user.id,
    },
  });

  const newsletterV1 = await prisma.widgetVersion.create({
    data: {
      widgetId: newsletterWidget.id,
      version: 1,
      schemaJson: templates[2].schemaJson,
      published: false,
    },
  });

  await prisma.widget.update({
    where: { id: newsletterWidget.id },
    data: { currentVersionId: newsletterV1.id },
  });

  const feedbackWidget = await prisma.widget.create({
    data: {
      workspaceId: workspace.id,
      name: 'Post-Appointment Feedback',
      slug: 'post-appointment-feedback',
      description: 'Triggered after checkout to measure patient satisfaction.',
      status: WidgetStatus.PUBLISHED,
      embedToken: 'wt_demo_feedback_brightsmile',
      themeId: minimalTheme.id,
      createdBy: user.id,
      publishedAt: new Date('2026-07-20T14:30:00.000Z'),
    },
  });

  const feedbackV1 = await prisma.widgetVersion.create({
    data: {
      widgetId: feedbackWidget.id,
      version: 1,
      schemaJson: contactFormSchema(
        'Rate Your Visit',
        'Tell us about your experience with Dr. Patel and the front desk team.',
      ),
      published: true,
      publishedAt: new Date('2026-07-20T14:30:00.000Z'),
    },
  });

  await prisma.widget.update({
    where: { id: feedbackWidget.id },
    data: { currentVersionId: feedbackV1.id },
  });

  await prisma.submission.create({
    data: {
      workspaceId: workspace.id,
      widgetId: contactWidget.id,
      widgetVersionId: contactV1.id,
      payload: {
        name: 'Michael Torres',
        email: 'michael.torres@email.com',
        message: 'I would like to schedule a teeth whitening consultation for next week.',
      },
      country: 'US',
      browser: 'Chrome',
      device: 'desktop',
      ipHash: 'a3f5b8c2d1e94f60718293ab4cde5f678901234567890abcdef1234567890ab',
    },
  });

  await prisma.analyticsEvent.createMany({
    data: [
      {
        workspaceId: workspace.id,
        widgetId: contactWidget.id,
        type: AnalyticsEventType.VIEW,
        sessionId: 'sess_demo_001',
        visitorId: 'vis_demo_001',
        metadata: { pageUrl: 'https://brightsmile.dental/contact' },
      },
      {
        workspaceId: workspace.id,
        widgetId: contactWidget.id,
        type: AnalyticsEventType.OPEN,
        sessionId: 'sess_demo_001',
        visitorId: 'vis_demo_001',
        metadata: { trigger: 'floating_button' },
      },
      {
        workspaceId: workspace.id,
        widgetId: contactWidget.id,
        type: AnalyticsEventType.SUBMIT,
        sessionId: 'sess_demo_001',
        visitorId: 'vis_demo_001',
        metadata: { durationMs: 42000 },
      },
      {
        workspaceId: workspace.id,
        widgetId: feedbackWidget.id,
        type: AnalyticsEventType.VIEW,
        sessionId: 'sess_demo_002',
        visitorId: 'vis_demo_002',
        metadata: { pageUrl: 'https://brightsmile.dental/thank-you' },
      },
    ],
  });

  console.log('Seed complete.');
  console.log(`  Workspace : ${workspace.name} (${workspace.slug})`);
  console.log(`  User      : ${user.fullName} (${user.email})`);
  console.log(`  Themes    : 3`);
  console.log(`  Templates : ${templates.length}`);
  console.log(`  Widgets   : 3 (2 published, 1 draft)`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
