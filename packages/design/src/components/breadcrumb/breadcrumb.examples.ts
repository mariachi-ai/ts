import { defineExamples } from '../../contract/component';

// A 16px chevron; only its shape is used (it masks the separator colour)
const chevron = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 4 4 4-4 4'/%3E%3C/svg%3E";

export default defineExamples('breadcrumb', [
  {
    name: 'Path',
    html: `<nav class="m-breadcrumb" aria-label="Breadcrumb">
  <ol>
    <li><a href="#">Packages</a></li>
    <li><a href="#">@mariachi/ai</a></li>
    <li><a href="#">API</a></li>
    <li><span aria-current="page">createAI</span></li>
  </ol>
</nav>`,
  },
  {
    name: 'Custom separator',
    description: 'Change the glyph with one token.',
    html: `<nav class="m-breadcrumb" aria-label="Breadcrumb" style="--m-breadcrumb-separator: '›'">
  <ol>
    <li><a href="#">Settings</a></li>
    <li><a href="#">Billing</a></li>
    <li><span aria-current="page">Invoices</span></li>
  </ol>
</nav>`,
  },
  {
    name: 'Icon separator, underlined links',
    description: 'A chevron icon in the separator colour instead of a glyph, and links underlined at rest. Set in the theme; here inline.',
    html: `<nav class="m-breadcrumb" aria-label="Breadcrumb" style="--m-breadcrumb-separator: ''; --m-breadcrumb-separator-icon: url(&quot;${chevron}&quot;); --m-breadcrumb-separator-icon-size: 1rem; --m-breadcrumb-link-decoration: underline">
  <ol>
    <li><a href="#">Help</a></li>
    <li><a href="#">Payments</a></li>
    <li><span aria-current="page">Fees</span></li>
  </ol>
</nav>`,
  },
]);
