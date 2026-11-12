import type { APIRoute } from 'astro';
import { designFile, findLanguage, languageFontStylesheets, loadLanguages, withFontLinks } from '../../../../loaders/design';

export function getStaticPaths() {
  return loadLanguages().map((a) => ({ params: { id: a.id } }));
}

/** A language's generated gallery (every component in every state), as the package publishes it, plus its fonts. */
export const GET: APIRoute = async ({ params }) => {
  const language = findLanguage(String(params.id))!;
  const html = withFontLinks(designFile(language.gallery), await languageFontStylesheets(language, 'page'));
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
