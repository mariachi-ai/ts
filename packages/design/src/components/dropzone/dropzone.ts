import { defineComponent } from '../../contract/component';
import { ref, t } from '../../contract/tokens';

export const dropzone = defineComponent({
  name: 'dropzone',
  title: 'Drop zone',
  category: 'forms',
  description: 'A file input as a dashed area to click or drop files on: a <label> around a native <input type="file">, with hover, focus and drag-over states.',
  useWhen: 'Uploading files or images in a form. One native input underneath, so keyboard, screen readers and the file picker work as usual.',
  anatomy: {
    'label.m-dropzone': 'The area; wraps the input and the text',
    'input[type="file"]': 'The native input, stretched invisibly over the area so a click or a drop anywhere lands on it',
    '.m-dropzone-title': 'The main line ("Drop files here or browse")',
    '.m-dropzone-hint': 'Optional muted line: types and the size limit',
    '[data-dragover]': 'Files are being dragged over the area (set by the behaviours, or by your own dragenter and dragleave handlers)',
  },
  tokens: {
    padding: t.length('Padding', ref('space.6')),
    gap: t.length('Space between the icon and the lines', ref('space.2')),
    minHeight: t.length('Smallest height', '8rem'),
    radius: t.length('Corner radius', ref('radius.container')),
    borderWidth: t.length('Border width', ref('borderWidth.thick')),
    borderStyle: t.keyword('Border style (dashed, solid)', 'dashed'),
    border: t.color('Border', ref('color.border.strong')),
    bg: t.color('Background', ref('color.bg.surface')),
    fg: t.color('Text', ref('color.fg.default')),
    hintFg: t.color('Hint text', ref('color.fg.muted')),
    hoverBg: t.color('Background on hover', ref('color.bg.sunken')),
    dragBg: t.color('Background while files are dragged over', ref('color.accent.subtle')),
    dragBorder: t.color('Border while files are dragged over', ref('color.accent.default')),
    fontSize: t.length('Text size', ref('font.size.sm')),
    titleWeight: t.fontWeight('Main line weight', ref('font.weight.medium')),
  },
  contrast: [
    { fg: 'fg', bg: 'bg', min: 4.5 },
    { fg: 'hintFg', bg: 'bg', min: 4.5 },
    { fg: 'fg', bg: 'dragBg', min: 4.5 },
    { fg: 'border', bg: 'color.bg.canvas', min: 3 },
  ],
  a11y: [
    'The native input stays in the page and takes focus, so Tab, Space and Enter open the file picker and the label names it.',
    'Say the accepted types and the size limit in the hint, and match them with the input\'s accept attribute.',
    'After files are chosen, list them as text near the zone; announce upload errors with an .m-field-error tied by aria-describedby.',
  ],
});
