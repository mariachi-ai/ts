import { defineExamples } from '../../contract/component';

const icon = (d: string) =>
  `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const card = icon('M2 4.5h12v7H2zM2 7h12');
const cart = icon('M2 2.5h2l1.5 8h7l1.5-6H5M6.5 13.5h.01M11.5 13.5h.01');
const plane = icon('M14 2 7 9M14 2l-4.5 12L7 9 2 6.5z');

export default defineExamples('tile', [
  {
    name: 'Sizes',
    html: `<div class="m-cluster">
  <span class="m-tile" data-size="sm" aria-hidden="true">${card}</span>
  <span class="m-tile" aria-hidden="true">${card}</span>
  <span class="m-tile" data-size="lg" aria-hidden="true">${card}</span>
</div>`,
  },
  {
    name: 'Tones',
    description: 'Categories as tiles: the tone tells them apart, the label beside each says what it is.',
    html: `<div class="m-cluster" data-gap="4">
  <span class="m-cluster" data-gap="2"><span class="m-tile" aria-hidden="true">${card}</span>Bills</span>
  <span class="m-cluster" data-gap="2"><span class="m-tile" data-tone="neutral" aria-hidden="true">${cart}</span>Shopping</span>
  <span class="m-cluster" data-gap="2"><span class="m-tile" data-tone="info" aria-hidden="true">${plane}</span>Travel</span>
  <span class="m-cluster" data-gap="2"><span class="m-tile" data-tone="success" aria-hidden="true">A</span>Income</span>
  <span class="m-cluster" data-gap="2"><span class="m-tile" data-tone="warning" aria-hidden="true">🍽️</span>Dining</span>
</div>`,
  },
]);
