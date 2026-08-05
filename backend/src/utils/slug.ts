export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildUniqueSlug(baseSlug: string, attempt: number): string {
  if (attempt === 0) {
    return baseSlug;
  }

  return `${baseSlug}-${String(attempt)}`;
}
