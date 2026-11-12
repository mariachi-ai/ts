import type { APIRoute } from 'astro';
import { designFile } from '../../../loaders/design';

/** The galleries' stylesheet (the library with hover, focus and pressed drawable statically), beside the language folders as in the package. */
export const GET: APIRoute = () =>
  new Response(designFile('archetypes/gallery.css'), { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
