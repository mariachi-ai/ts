import { defineExamples } from '../../contract/component';

const upload =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>';

export default defineExamples('dropzone', [
  {
    name: 'Drop zone',
    description: 'Click, Tab and Space, or drop files anywhere on it: the native input lies over the whole area.',
    html: `<div class="m-field">
  <span class="m-field-label" id="ex-drop-label">Receipts</span>
  <label class="m-dropzone">
    <input type="file" multiple accept="image/png,image/jpeg,application/pdf" aria-labelledby="ex-drop-label ex-drop-title" aria-describedby="ex-drop-hint">
    ${upload}
    <span class="m-dropzone-title" id="ex-drop-title">Drop files here or browse</span>
    <span class="m-dropzone-hint" id="ex-drop-hint">PNG, JPG or PDF, up to 10 MB each</span>
  </label>
</div>`,
  },
  {
    name: 'Files dragged over',
    description: 'The state the behaviours set while files are over the area.',
    html: `<label class="m-dropzone" data-dragover>
  <input type="file" aria-describedby="ex-drop2-hint">
  ${upload}
  <span class="m-dropzone-title">Drop to upload</span>
  <span class="m-dropzone-hint" id="ex-drop2-hint">One CSV file, up to 5 MB</span>
</label>`,
  },
]);
