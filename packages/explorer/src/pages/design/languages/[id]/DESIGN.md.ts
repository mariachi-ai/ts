import type { APIRoute } from 'astro';
import { designFile, findLanguage, loadLanguages } from '../../../../loaders/design';

export function getStaticPaths() {
  return loadLanguages().map((a) => ({ params: { id: a.id } }));
}

/** A language's DESIGN.md as agents read it, with its generated reference. */
export const GET: APIRoute = ({ params }) =>
  new Response(designFile(findLanguage(String(params.id))!.designDoc), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
