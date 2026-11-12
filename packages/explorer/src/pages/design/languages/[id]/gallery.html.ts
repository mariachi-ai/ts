import type { APIRoute } from 'astro';
import { designFile, findLanguage, loadLanguages } from '../../../../loaders/design';

export function getStaticPaths() {
  return loadLanguages().map((a) => ({ params: { id: a.id } }));
}

/** A language's generated gallery (every component in every state), as the package publishes it. */
export const GET: APIRoute = ({ params }) =>
  new Response(designFile(findLanguage(String(params.id))!.gallery), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
