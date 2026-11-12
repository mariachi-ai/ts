import type { APIRoute } from 'astro';
import { designFile } from '../../../loaders/design';

/** The library CSS at its package path (`css/mariachi.css`), for the design languages' gallery and recipe pages. */
export const GET: APIRoute = () => new Response(designFile('css/mariachi.css'), { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
