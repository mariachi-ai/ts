import { defineExamples } from '../../contract/component';

const figure = (whole: string, cents: string, style = '') =>
  `<span class="m-amount"${style ? ` style="${style}"` : ''}><span class="m-amount-currency">$</span>${whole}<span class="m-amount-cents">.${cents}</span></span>`;

export default defineExamples('amount', [
  {
    name: 'Plain',
    description: 'By default the parts look like the rest of the figure; the digits are tabular, so columns of amounts line up.',
    html: `<div class="m-stack" data-gap="1" style="align-items: end">
  ${figure('1,204', '00')}
  ${figure('86', '45')}
  ${figure('12,480', '52')}
</div>`,
  },
  {
    name: 'Raised cents and sign',
    description: 'A language that sets small raised cents and a small raised sign does it once, in its tokens; here inline.',
    html: `<p style="font-size: var(--m-font-size-3xl); font-weight: var(--m-font-weight-semibold)">${figure(
      '5,216,471',
      '18',
      '--m-amount-currency-size: 0.6em; --m-amount-currency-raise: 0.55em; --m-amount-currency-gap: 0.05em; --m-amount-cents-size: 0.6em; --m-amount-cents-raise: 0.55em',
    )}</p>`,
  },
  {
    name: 'Small cents on the baseline',
    html: `<p style="font-size: var(--m-font-size-4xl); font-weight: var(--m-font-weight-bold)">${figure('12,480', '52', '--m-amount-cents-size: 0.5em')}</p>`,
  },
]);
