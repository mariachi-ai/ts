import { defineComponent } from '../../contract/component';
import { t } from '../../contract/tokens';

export const amount = defineComponent({
  name: 'amount',
  title: 'Amount',
  category: 'data',
  description: 'A money figure with tabular digits and optional parts: a currency sign and cents, each sized and raised by tokens.',
  useWhen: 'Balances, prices and totals, so every figure in a language sets its sign and cents the same way without inline styles.',
  anatomy: {
    '.m-amount': 'On the <span> (or <data value>) holding the whole figure; tabular digits, no wrapping',
    '.m-amount-currency': 'Optional: the currency sign or code',
    '.m-amount-cents': 'Optional: the decimal part, with its separator (".52")',
  },
  tokens: {
    numeric: t.keyword('font-variant-numeric for the figure', 'tabular-nums'),
    currencySize: t.length('Currency sign size, relative to the figure (1em: the same size)', '1em'),
    currencyRaise: t.length('How far the currency sign is raised above the baseline', '0em'),
    currencyGap: t.length('Space between the currency sign and the digits', '0em'),
    centsSize: t.length('Cents size, relative to the figure (1em: the same size)', '1em'),
    centsRaise: t.length('How far the cents are raised above the baseline', '0em'),
  },
  a11y: [
    'Keep the figure as one run of text ("$12,480.52") so it is read as one amount; the parts only change its look.',
    'Put the machine value on a <data value="12480.52"> when scripts or search need it.',
    'Say the sign of a change in words or with a minus sign (−), not by colour alone.',
  ],
});
