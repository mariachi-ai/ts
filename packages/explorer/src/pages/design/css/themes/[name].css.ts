import type { APIRoute } from 'astro';
import { designFile, loadDesign } from '../../../../loaders/design';

export function getStaticPaths() {
  return loadDesign().presets.map((p) => ({ params: { name: p.name } }));
}

/** A preset's theme CSS at its package path (`css/themes/<name>.css`), as published in @mariachi/design/themes/<name>.css. */
export const GET: APIRoute = ({ params }) =>
  new Response(designFile(`css/themes/${params.name}.css`), { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
