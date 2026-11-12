import type { APIRoute } from 'astro';
import { designFile, findLanguage, loadLanguages } from '../../../../../loaders/design';

export function getStaticPaths() {
  return loadLanguages().flatMap((a) => a.recipes.map((r) => ({ params: { id: a.id, recipe: r.name } })));
}

/** One of a language's recipe pages, as the package publishes it. */
export const GET: APIRoute = ({ params }) => {
  const recipe = findLanguage(String(params.id))!.recipes.find((r) => r.name === params.recipe)!;
  return new Response(designFile(recipe.file), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
};
