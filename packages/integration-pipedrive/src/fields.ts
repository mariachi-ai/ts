import type { FieldValues } from './schemas';

/** A custom field's code: Pipedrive makes it a random 40-character hash. Standard fields have names (`owner_id`). */
export function isCustomFieldKey(key: string): boolean {
  return /^[A-Za-z0-9]{40}$/.test(key);
}

/**
 * Field values as Pipedrive's API v2 takes them: standard fields at the top of the body, custom fields under
 * `custom_fields`, by their 40-character code. Find a field's code with `personFields.list` (or `dealFields`,
 * `organizationFields`): its `field_code`. `null` clears a custom field.
 *
 * ```ts
 * fieldsBody({ visible_to: 3, dcf558aac1ae4e8c4f849ba5e668430d8df9be12: 'Enterprise' })
 * // { visible_to: 3, custom_fields: { dcf558aac1ae4e8c4f849ba5e668430d8df9be12: 'Enterprise' } }
 * ```
 */
export function fieldsBody(values: FieldValues | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const custom: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values ?? {})) {
    if (isCustomFieldKey(key)) custom[key] = value;
    else out[key] = value;
  }
  if (Object.keys(custom).length) out.custom_fields = custom;
  return out;
}

/**
 * Plain text as a note's HTML: `<`, `>`, `&` and quotes escaped, line breaks kept. A note's content is HTML, so
 * text with a `<` in it would otherwise be read as markup.
 */
export function noteHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r?\n/g, '<br>');
}
