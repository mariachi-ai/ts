import { defineExamples } from '../../contract/component';

const chevron = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 4 4 4-4 4"/></svg>';
const bell = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7a4 4 0 0 1 8 0c0 3 1.5 4 1.5 4h-11S4 10 4 7M6.5 13.5a1.5 1.5 0 0 0 3 0"/></svg>';
const lock = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>';

export default defineExamples('row', [
  {
    name: 'Settings list',
    description: 'Each row is one link with a tile, a title, a line of detail and a chevron. Hover and press need no extra CSS.',
    html: `<ul class="m-stack" data-gap="1">
  <li><a class="m-row" href="#"><span class="m-row-lead"><span class="m-tile">${bell}</span></span><span class="m-row-body"><span class="m-row-title">Notifications</span><span class="m-row-meta">Email and push</span></span><span class="m-row-trail">${chevron}</span></a></li>
  <li><a class="m-row" href="#" aria-current="page"><span class="m-row-lead"><span class="m-tile">${lock}</span></span><span class="m-row-body"><span class="m-row-title">Security</span><span class="m-row-meta">Two-step sign-in is on</span></span><span class="m-row-trail">${chevron}</span></a></li>
  <li><button type="button" class="m-row" disabled><span class="m-row-body"><span class="m-row-title">Export data</span><span class="m-row-meta">Available on paid plans</span></span></button></li>
</ul>`,
  },
  {
    name: 'With a value',
    html: `<ul class="m-stack" data-gap="0">
  <li><a class="m-row" href="#"><span class="m-row-lead"><span class="m-avatar" data-size="sm" aria-hidden="true">KJ</span></span><span class="m-row-body"><span class="m-row-title">Katherine Johnson</span><span class="m-row-meta">Yesterday</span></span><span class="m-row-trail"><span class="m-amount">−$42.10</span></span></a></li>
  <li><a class="m-row" href="#"><span class="m-row-lead"><span class="m-avatar" data-size="sm" aria-hidden="true">GH</span></span><span class="m-row-body"><span class="m-row-title">Grace Hopper</span><span class="m-row-meta">12 Nov</span></span><span class="m-row-trail"><span class="m-amount">$1,250.00</span></span></a></li>
</ul>`,
  },
]);
