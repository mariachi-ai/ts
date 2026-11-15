import { defineExamples } from '../../contract/component';

const check = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 8.5 3 3 7-7"/></svg>';
const x = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>';

export default defineExamples('chip', [
  {
    name: 'Filters',
    description: 'Toggle chips: buttons with aria-pressed. The selected one adds a check, so it differs by more than colour.',
    html: `<div class="m-cluster" data-gap="2" role="group" aria-label="Filter by status">
  <button type="button" class="m-chip" aria-pressed="true">${check} Open</button>
  <button type="button" class="m-chip" aria-pressed="false">Merged</button>
  <button type="button" class="m-chip" aria-pressed="false">Closed</button>
  <button type="button" class="m-chip" aria-pressed="false" disabled>Draft</button>
</div>`,
  },
  {
    name: 'One choice',
    description: 'Radios in label chips: arrow keys move the choice.',
    html: `<div class="m-cluster" data-gap="2" role="radiogroup" aria-label="Period">
  <label class="m-chip" data-size="sm"><input type="radio" name="ex-chip-period" checked> Week</label>
  <label class="m-chip" data-size="sm"><input type="radio" name="ex-chip-period"> Month</label>
  <label class="m-chip" data-size="sm"><input type="radio" name="ex-chip-period"> Year</label>
</div>`,
  },
  {
    name: 'Removable',
    html: `<div class="m-cluster" data-gap="2">
  <span class="m-chip">Design <button type="button" class="m-chip-remove" aria-label="Remove Design">${x}</button></span>
  <span class="m-chip">Research <button type="button" class="m-chip-remove" aria-label="Remove Research">${x}</button></span>
</div>`,
  },
]);
