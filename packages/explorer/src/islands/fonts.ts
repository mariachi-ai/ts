/**
 * Lazy font stylesheets for cards drawn in their own design language: each `[data-x-fonts]` (a
 * JSON list of stylesheet URLs) adds its links once it nears the viewport. Each URL loads once;
 * offline a link just fails and the card keeps its fallback fonts.
 */
export function loadFontsWhenVisible(): void {
  const added = new Set([...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((l) => l.href));
  const load = (el: HTMLElement) => {
    let urls: string[] = [];
    try {
      urls = JSON.parse(el.dataset.xFonts ?? '[]') as string[];
    } catch {
      return;
    }
    for (const url of urls) {
      if (added.has(url)) continue;
      added.add(url);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.append(link);
    }
  };
  const cards = [...document.querySelectorAll<HTMLElement>('[data-x-fonts]')];
  if (!('IntersectionObserver' in window)) {
    for (const card of cards) load(card);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        load(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '200px' },
  );
  for (const card of cards) observer.observe(card);
}
