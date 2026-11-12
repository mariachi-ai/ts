import type { APIRoute } from 'astro';
import { designFile, findLanguage, languageFontStylesheets, loadLanguages, withFontLinks } from '../../../../../loaders/design';

export function getStaticPaths() {
  return loadLanguages().flatMap((a) => a.recipes.map((r) => ({ params: { id: a.id, recipe: r.name } })));
}

/** One of a language's recipe pages, as the package publishes it, plus its fonts. */
export const GET: APIRoute = async ({ params }) => {
  const language = findLanguage(String(params.id))!;
  const recipe = language.recipes.find((r) => r.name === params.recipe)!;
  const html = withFontLinks(designFile(recipe.file), await languageFontStylesheets(language, 'page'));
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
