export const SUPPORTED_FIELD_TYPES = [
  'text',
  'email',
  'phone',
  'number',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'date',
  'url',
  'hidden',
] as const;

export type FieldType = (typeof SUPPORTED_FIELD_TYPES)[number];

export const TRIGGER_TYPES = [
  'immediate',
  'delay',
  'scroll',
  'exit_intent',
  'click',
  'page_load',
  'floating_button',
] as const;

export type TriggerType = (typeof TRIGGER_TYPES)[number];

export const LAYOUT_TYPES = ['popup', 'inline', 'floating', 'modal'] as const;

export type LayoutType = (typeof LAYOUT_TYPES)[number];

export const LAYOUT_ALIGNMENTS = ['left', 'center', 'right'] as const;

export type LayoutAlignment = (typeof LAYOUT_ALIGNMENTS)[number];

export interface WidgetField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface WidgetSchemaDocument {
  version: number;
  content: Record<string, unknown>;
  layout: Record<string, unknown>;
  theme: Record<string, unknown>;
  fields: WidgetField[];
  behavior: Record<string, unknown>;
  triggers: Record<string, unknown>;
  localization: Record<string, unknown>;
  animations: Record<string, unknown>;
  metadata: Record<string, unknown>;
  components?: unknown[];
}

export interface SchemaValidationError {
  path: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaValidationError[];
}

export interface WidgetSchemaDto {
  widgetId: string;
  versionId: string;
  version: number;
  published: boolean;
  schema: WidgetSchemaDocument;
  updatedAt: string;
}

export interface WidgetSchemaValidationDto {
  valid: boolean;
  errors: SchemaValidationError[];
}
