/**
 * Client-side filtering for index pages. Items carry `data-x-item` and `data-x-text` (lowercased
 * search text), optionally `data-x-status-value` and `data-x-facets` (JSON: facet → values); groups
 * (`data-x-group`) hide when empty. Facets are `<select data-x-facet="<key>">` in the filter (empty
 * value = any); `?q=` and `?<facet>=` preset them, `[data-x-reset]` clears everything and
 * `[data-x-count]` shows how many items match.
 */
export function bindFilter(name: string): void {
  const root = document.querySelector<HTMLElement>(`[data-x-filter="${name}"]`);
  if (!root) return;
  const input = root.querySelector<HTMLInputElement>('input[type="search"]');
  const statusButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-x-status]')];
  const facets = [...root.querySelectorAll<HTMLSelectElement>('select[data-x-facet]')];
  const reset = root.querySelector<HTMLButtonElement>('[data-x-reset]');
  const count = root.querySelector<HTMLElement>('[data-x-count]');
  const items = [...document.querySelectorAll<HTMLElement>('[data-x-item]')];
  const itemFacets = new Map(items.map((item) => [item, parseFacets(item.dataset.xFacets)]));
  let status = 'all';
  const apply = () => {
    const query = (input?.value ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    const chosen = facets.filter((f) => f.value !== '').map((f) => [f.dataset.xFacet ?? '', f.value] as const);
    let shown = 0;
    for (const item of items) {
      const text = item.dataset.xText ?? '';
      const values = itemFacets.get(item) ?? {};
      const ok =
        query.every((q) => text.includes(q)) &&
        (status === 'all' || item.dataset.xStatusValue === status) &&
        chosen.every(([key, value]) => values[key]?.includes(value));
      item.toggleAttribute('data-x-hidden', !ok);
      if (ok) shown++;
    }
    for (const group of document.querySelectorAll<HTMLElement>('[data-x-group]')) {
      group.toggleAttribute('data-x-hidden', !group.querySelector('[data-x-item]:not([data-x-hidden])'));
    }
    const empty = document.querySelector<HTMLElement>('[data-x-empty]');
    if (empty) empty.hidden = shown > 0;
    if (count) count.textContent = shown === items.length ? `${items.length} shown` : `${shown} of ${items.length} shown`;
    if (reset) reset.hidden = query.length === 0 && chosen.length === 0 && status === 'all';
  };
  input?.addEventListener('input', apply);
  for (const select of facets) select.addEventListener('change', apply);
  for (const button of statusButtons) {
    button.addEventListener('click', () => {
      status = button.dataset.xStatus ?? 'all';
      for (const b of statusButtons) b.setAttribute('aria-pressed', String(b === button));
      apply();
    });
  }
  reset?.addEventListener('click', () => {
    if (input) input.value = '';
    for (const select of facets) select.value = '';
    status = 'all';
    for (const b of statusButtons) b.setAttribute('aria-pressed', String(b.dataset.xStatus === 'all'));
    apply();
    input?.focus();
  });
  const params = new URLSearchParams(location.search);
  const initial = params.get('q');
  if (initial && input) input.value = initial;
  for (const select of facets) {
    const value = params.get(select.dataset.xFacet ?? '');
    if (value && [...select.options].some((o) => o.value === value)) select.value = value;
  }
  if (initial || facets.length > 0 || count || reset) apply();
}

function parseFacets(json: string | undefined): Record<string, string[]> {
  if (!json) return {};
  try {
    return JSON.parse(json) as Record<string, string[]>;
  } catch {
    return {};
  }
}
