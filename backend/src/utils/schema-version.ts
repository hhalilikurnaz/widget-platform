import type { WidgetSchemaDocument } from '../types/widget-schema.types.js';

export const CURRENT_SCHEMA_VERSION = 1;

export const SUPPORTED_SCHEMA_VERSIONS = [1] as const;

const DEFAULT_SECTIONS: Pick<
  WidgetSchemaDocument,
  'content' | 'layout' | 'theme' | 'fields' | 'behavior' | 'triggers' | 'localization' | 'animations' | 'metadata'
> = {
  content: {},
  layout: {},
  theme: {},
  fields: [],
  behavior: {},
  triggers: {},
  localization: {},
  animations: {},
  metadata: {},
};

export function isSupportedSchemaVersion(version: unknown): version is number {
  return typeof version === 'number' && SUPPORTED_SCHEMA_VERSIONS.includes(version as 1);
}

export function normalizeSchemaDocument(input: unknown): WidgetSchemaDocument {
  const source = isRecord(input) ? input : {};

  const version = isSupportedSchemaVersion(source.version) ? source.version : CURRENT_SCHEMA_VERSION;

  return {
    version,
    content: isRecord(source.content) ? source.content : DEFAULT_SECTIONS.content,
    layout: isRecord(source.layout) ? source.layout : DEFAULT_SECTIONS.layout,
    theme: isRecord(source.theme) ? source.theme : DEFAULT_SECTIONS.theme,
    fields: extractFields(source),
    behavior: isRecord(source.behavior) ? source.behavior : DEFAULT_SECTIONS.behavior,
    triggers: isRecord(source.triggers) ? source.triggers : DEFAULT_SECTIONS.triggers,
    localization: isRecord(source.localization) ? source.localization : DEFAULT_SECTIONS.localization,
    animations: isRecord(source.animations) ? source.animations : DEFAULT_SECTIONS.animations,
    metadata: isRecord(source.metadata) ? source.metadata : DEFAULT_SECTIONS.metadata,
    ...(Array.isArray(source.components) ? { components: source.components } : {}),
  };
}

function extractFields(source: Record<string, unknown>): WidgetSchemaDocument['fields'] {
  if (Array.isArray(source.fields)) {
    return source.fields as WidgetSchemaDocument['fields'];
  }

  if (!Array.isArray(source.components)) {
    return [];
  }

  const legacyFields: WidgetSchemaDocument['fields'] = [];

  for (const component of source.components) {
    if (!isRecord(component) || component.type !== 'field' || !isRecord(component.properties)) {
      continue;
    }

    const id = typeof component.id === 'string' ? component.id : '';
    const fieldType = component.properties.fieldType;
    const label = component.properties.label;

    if (!id || typeof fieldType !== 'string' || typeof label !== 'string') {
      continue;
    }

    legacyFields.push({
      id,
      type: fieldType as WidgetSchemaDocument['fields'][number]['type'],
      label,
      ...(typeof component.properties.required === 'boolean'
        ? { required: component.properties.required }
        : {}),
      ...(typeof component.properties.placeholder === 'string'
        ? { placeholder: component.properties.placeholder }
        : {}),
    });
  }

  return legacyFields;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
