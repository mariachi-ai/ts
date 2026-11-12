# Chalk

Category: calm and minimal. Native and calm: black ink on white panes beside a system-grey sidebar,
white inset groups on a grey grouped page, one clear blue for doing things, a warm signature yellow
for the selected note, checked checklist circles and highlighted text, round coloured list icons
with counts, capsule buttons, glass toolbars and big bold titles. Dark mode is true black with
near-black grouped rows. For notes, lists and to-do apps that should feel as familiar as the ones
built into a phone.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `chalk` preset of `@mariachi/design` (`data-theme="chalk"`,
`themes/chalk.css`).

## Principles

- **The content is the interface.** White panes, black text, nothing decorative. Structure comes
  from a grey sidebar, grey grouped pages and hairline separators, never from frames or shadows on
  content.
- **One blue for doing things.** The blue fills the primary capsule, the current sidebar row, the
  highlighted menu row, checked controls and switches, and colours quiet text buttons ("Show",
  "Clear"). The yellow is the signature, not an action: the selected note, checked checklist
  circles, notebook folders, highlighted text.
- **Every list has a colour.** A project or list owns one colour: its round icon in the sidebar,
  its big title, its section heading, its checked circles, its tags and its round add button.
- **Counts everywhere, quietly.** Smart tiles carry a big bold count; sidebar rows end in a plain
  grey number. Nothing is badged in red.
- **Native, translated.** It reads like a desktop and phone app moved to the web: a floating
  sidebar, glass capsule toolbars, inset groups. Keep that calm; don't add web chrome (banners,
  heavy headers, card shadows).

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Grouped page (canvas) | system grey `#f2f2f7` | true black `#000000` |
| Panes, inset groups, fields (surface) | white `#ffffff` | `#1c1c1e` |
| Menus, popovers, sheets (raised) | white | `#2c2c2e` |
| Sidebar and wells (sunken) | `#f2f2f7` | `#2c2c2e` |
| Text: default, muted, subtle | black `#000000`, `#636366`, `#6e6e73` | white, `#98989f`, `#939397` |
| Separators | `#e5e5ea`; lighter `#efeff4` | `#38383a`; `#2c2c2e` |
| Control edges (empty circles, fields) | `#8b8b90` | `#6c6c70` |
| Blue: fill, hover, pressed | `#1e6ef4`, `#1b63dc`, `#1858c3` | the same |
| Blue: tint, text | `#e0f1ff`, `#1c65e0` | `#0e2a42`, `#0d97ff` |
| Yellow (brand): fill, tint | `#e4af09`, `#fbe59b` | `#ffd60a`, `#605418` |
| Green, orange, red (solids) | `#008932`, `#c55300`, `#e9152d` | the same |
| Green, orange, red (text) | `#007f2f`, `#b74d00`, `#d41329` | `#30d158`, `#ff9230`, `#ff6165` |
| Neutral fill (grey buttons, chips, segment track) | `#e9e9eb` | `#3a3a3c` |

- **Radius.** 6px for small things (tooltips, keys, square settings icons); 10px for sidebar rows,
  fields, inset groups and note rows; 14px for menus, smart-list tiles and banners; 16px for the
  sidebar panel, cards and tables; 20px for sheets, alerts and notification banners. Buttons,
  segmented controls, chips, search fields and switches are capsules; list icons, checklist
  circles and avatars are round.
- **Shadow.** None on content. Glass controls (toolbar buttons and groups): a half-pixel edge and
  `0 1px 3px` at 10%. Menus and popovers: `0 8px 28px` at 14%. Sheets, alerts and banners:
  `0 20px 60px` at 22%. In dark mode the edge is a light half-pixel line and the shadows are black.
- **Motion.** 150, 250 and 400 ms; `cubic-bezier(0.25, 0.1, 0.25, 1)` for state changes and
  `cubic-bezier(0.32, 0.72, 0, 1)` (a soft spring-like settle) for sheets and popovers.
- **Spacing.** A 4px unit. The usual gaps are:
  - 2px between sidebar rows, 8px between tiles;
  - 8px inside a row, 12px between a circle and its text;
  - 16px inside inset groups, 24px between groups;
  - 32px around the main pane's content.
- **Layout.**
  - A 280px sidebar floating 8px inside the page, grey, with 16px corners.
  - The main pane on white beside it; a 20rem note column between them for notes.
  - Grouped pages (settings, sheets, plans) on the grey canvas, 44rem wide, white inset groups.
  - Lists have no frame: rows of circles and text, sections split by a hairline.
- **Density.** 1 by default; `--m-density: 0.85` for long lists.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Inter (variable, with optical sizes) for everything. Load
  `@fontsource-variable/inter/opsz.css` so headings switch to the display cut by size, as the
  reference's own system face does. Mono is Roboto Mono, only for codes and error numbers.
- **Weights.** 400 for text, 500 for buttons, 600 for row titles, section labels and tile names,
  700 for titles, note titles and counts.
- **Sizes** (the phone ramp, in px):
  - 34 bold: page and list titles, with the count at the same size, regular, on the right;
  - 28 bold: a note's title; 22 bold: empty-state lines; 20 bold: section headings in a list;
  - 17: card titles and settings headings; 15: body, rows and controls (1.35 line height);
  - 13: secondary lines, section labels, footnotes; 12: captions.
- **Case.** Sentence case everywhere. No capitals for labels; section labels are grey 13px at 600.
- **Figures.** Tabular numbers for counts and dates.

## Icons

- Lucide, outlined, **1.75 stroke** on the 24px grid (about 1.4px at 18px, like the system's
  regular weight): 18px in toolbars and sidebar rows, 16px in buttons, 14px on round list icons
  (in white, stroke 2.25), 20px on smart tiles, 48–52px grey for empty and error pages.
- Toolbar icons are black (white in dark), never blue. Quiet text buttons are blue.
- Notebook folders are yellow outlines; list icons are white glyphs on a round colour.
- **The same icon for the same action, every time:**
  - add `plus`, edit `square-pen` (also "new note"), delete `trash`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis`, close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `arrow-up` (in a round blue button), refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Charts are rare in this language; when needed, keep them plain: no gridlines, grey 13px labels,
  rounded bars, 2px lines.
- **Series colours** are the list colours in the order people pick them: blue, orange, green,
  purple, red, yellow, indigo, brown (light and dark values in the reference).
- Progress toward a goal is a 4px capsule bar on a grey track, or a ring in the list's colour.

## States (every control)

- **Hover.** Grey fills: sidebar rows take `#e5e5ea` (`#3a3a3c` in dark), grey buttons go one step
  darker, text buttons get a faint grey capsule. Nothing moves.
- **Focus.** A 3px blue ring hugging the control, on keyboard focus only. Never remove it.
- **Pressed.** One step darker again.
- **Disabled.** Half opacity; the cursor stays default.
- **Error.** The field's edge turns red and a red 13px line below says how to fix it; a sheet also
  shows a red banner saying nothing was saved.
- **Loading.** Grey rounded bars where text will be; a small grey ring spinner inside buttons.
  Never a spinner over the whole page.
- **Selected.** The current sidebar row is solid blue with white text and count. The selected note
  is pale yellow. A current smart tile gets a ring in its own colour.

## Components

All 36 of the library's components, as Chalk draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: up to 68rem, 44rem for grouped pages, 30rem for narrow forms;
- `m-split`, the 280px sidebar beside the main pane (nest a second split for a 20rem note column);
- `m-grid`, for plan cards and tiles: 16px gaps;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** Capsules, weight 500. 28px (`sm`) in sheets and rows, 36px by default, 44px (`lg`)
  for a sheet's main action and the round add button.
  - **Primary:** solid blue, white text, one per view (in a list, the round add button takes the
    list's colour).
  - **Secondary:** a grey fill, black text: Cancel, Not now, secondary choices.
  - **Ghost:** blue text, no fill, for quiet actions ("Show", "Clear", "Contact support").
  - **Danger:** solid red, only to confirm a deletion.
  - **Icon-only:** a 36px circle. In toolbars it is glass: white, a half-pixel edge and a soft lift,
    a black glyph; related tools share one glass capsule.
- **Input, textarea.** 36px, 10px radius, white, a grey edge that turns blue with a 3px ring on
  focus. Inside an inset group, fields drop their edge and sit on the row. Search fields are glass
  capsules with a grey magnifier.
- **Select.** A pop-up: inside a row it is borderless grey text with an up-and-down chevron.
- **Field.** The label above in 15px regular (or to the left, inside a row), the hint or error below
  in 13px.
- **Checkbox.** A round 22px checklist circle with a grey edge; checked fills with the list's
  colour and a white tick. In notes the checked circle is the yellow with a black tick.
- **Radio.** A round circle with a white dot on blue when chosen.
- **Switch.** A wide 50 × 28px capsule, grey when off, blue when on, a white knob with a soft shadow.
  It takes effect at once.

**Navigation**
- **Sidebar.** 280px, grey, floating with 16px corners.
  - Top: the app's mark and name, then glass circle buttons (new list, hide sidebar).
  - Smart tiles: a 2-column grid of solid colour tiles, 14px corners, a white glyph and a big bold
    count on top, the name in 600 below.
  - Sections under grey 13px labels ("Projects", "Notebooks"): rows with a round colour icon or a
    yellow folder, the name, and a plain grey count at the right.
  - The current row is solid blue with white text and count, 10px corners.
- **Navbar** (public pages). White and borderless, 52px, the mark and name in bold at the left,
  black links, a blue capsule at the right.
- **Tabs.**
  - **Pill** (the segmented control): a grey capsule track, the chosen segment a white capsule with
    a soft lift (in dark, a lighter grey).
  - **Underline:** a 2px blue line under the current tab, used sparingly.
- **Breadcrumb.** Grey links separated by "›", the current page in black at 600. Prefer a back
  chevron in a glass circle.
- **Pagination.** Capsule page buttons, the current one blue. Lists prefer to scroll.

**Data and content**
- **Table.** An inset white group with 16px corners: grey 13px column labels at 500 (sentence case),
  15px rows, hairline separators, grey hover. Inside notes, a plain grid with a hairline frame.
- **Lists** (tasks and notes, not tables): no frame. Task rows are a 22px circle, the title and a
  grey 13px line with the when and a tag in the list's colour; each section ends in a dotted circle
  for a new item. Note rows are a bold title, then the date and a grey preview, then the notebook,
  separated by inset hairlines.
- **Card.** The inset group: white on the grouped grey, 16px corners, no border, no shadow, 20px
  padding, a 17px title at 600.
- **Badge.** The tag chip: a grey capsule, 24px, 13px regular text in black. Tones are tinted
  capsules.
- **Avatar.** The monogram disc: grey with white initials at 600; 24, 32 and 44px.
- **Divider.** A hairline; inside groups, separators start where the text starts.
- **Accordion.** Collapsible sections: bold 17px headings with a chevron, hairlines between, on a
  white group.
- **Code, kbd.** Roboto Mono at 13px on the grey well with 10px corners. Keys are the system face
  on a grey 6px chip (⌘N), no border.
- **Prose.** A note: 15px with a 1.5 line height, a 28px bold title, 22px headings, links in blue,
  block quotes with a grey bar.
- **Progress.** A 4px capsule, blue on a grey track.
- **Meter.** The same bar, green, orange past high, red past the maximum.
- **Usage.** A label and amount over a 4px bar.

**Feedback and overlays**
- **Alert.** The banner: a tinted rounded card (14px), no border, an 18px glyph, the title at 600.
  Offline and sync problems are orange; a sheet's "2 things to fix" is red.
- **Toast.** The notification banner: raised, 20px corners, the deep soft shadow, a glyph, a bold
  title, one line of detail and one grey capsule action.
- **Dialog.** Sheets and alerts: 20px corners, no border, the deep shadow over a 20% black scrim.
  Sheets have a glass close circle at the left, the title centred, a round blue tick at the right.
  Alerts are centred with full-width capsule buttons stacked, the destructive one red.
- **Popover and menu.** Raised glass with 14px corners and 5px padding; 30px rows at 15px; the
  highlighted row is solid blue with white text and 8px corners; hairlines between groups;
  shortcuts as grey glyphs at the right.
- **Tooltip.** A small pale box with a hairline edge, 13px black text, 6px corners, after 700ms.
- **Spinner.** A thin grey ring, inside buttons and small areas only.
- **Skeleton.** Grey rounded bars at text sizes, with a slow shimmer that stops under reduced
  motion.

**AI and chat**
- **Chat.** Message bubbles with 18px corners: the person's in blue with white text, on the right;
  replies in the grey fill with black text, on the left.
- **Composer.** A capsule-ish box (22px corners) with a grey edge and a soft lift; send is a round
  blue button with `arrow-up`.
- **Thinking.** A grey line ("Thinking…") with a soft pulse. **Tool call:** a hairline row with 12px
  corners, a glyph, the tool's name and a status chip.
- **Citation.** A round blue-tinted number chip; the source opens in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns red and a red 13px line below says what to do ("Enter the full
  postcode, like SW1A 2AA."). Validate on blur and on save, never while typing.
- **In a sheet:** a red banner at the top with the count and "Nothing was saved yet."; the tick
  stays available so people can try again.
- **Offline or out of sync:** an orange banner above the content saying where changes are kept and
  when they'll sync.
- **Somewhere else:** a notification banner with what happened, where, and one action ("Try again").
- **Destructive confirmation:** a centred alert naming the thing, what goes with it and that it
  can't be undone; the red capsule first, Cancel below.
- **A whole page:** in the content area, centred: a 48px grey glyph, "Error 404" in small grey mono,
  a 22px bold title, one sentence and one or two buttons.
  - **404:** "Can't find that note" with Go to your notes.
  - **500:** "Something went wrong" and "Nothing you wrote was lost", with Try again.
  - **403:** "This project isn't shared with you" with Ask for access.
- **Words.** Plain and calm. Say what happened, whether anything was lost, and what to do next. No
  codes in sentences, no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - The window: a white page with the grey sidebar floating inside it: the mark, glass buttons,
    four smart tiles, projects with round colour icons and counts, notebooks with yellow folders.
  - The main pane: a glass toolbar (a capsule of tools, a new-task circle, a search capsule), the
    smart list's big coloured title and count, a "finished · Clear" line, then tasks grouped by
    project under coloured headings, and the round add button.
- **List and detail.** Three panes: the sidebar on a notebook; the notes column (its title and
  count, notes grouped by month, the selected note pale yellow); the editor under a glass toolbar
  with the date centred, a 28px title, text, a yellow checklist, a table and tag chips.
- **Onboarding.** A welcome sheet on the grey: the mark, a 34px bold title, a grey line, three
  features each led by a large coloured glyph, a wide blue capsule and a blue text link.
- **Settings.** A white sidebar with a search capsule, the account row and settings with coloured
  square icons; the page in grey: grey section labels, white inset groups of rows with switches,
  pop-ups and chevrons, grey footnotes under groups, and a red text action at the end.
- **Empty state.** An empty project: its coloured title and 0, then centred a 52px grey glyph, a
  22px bold line, one sentence and a grey capsule button.
- **Pricing.** A grouped page: the mark, a 34px headline, a segmented control, three plans as white
  groups (space in 28px bold, the price, a green-ticked list, a capsule), the chosen one ringed in
  blue; questions in a white group and a grey footnote.
- **Errors.** The offline banner, a sheet with field errors, a notification banner, a destructive
  alert and the three whole-page errors.

## Words

- Short, calm and plain, sentence case: "Quick wins", "3 finished this week", "No calls to make".
- Dates are short and local ("Thu, 9:00", "Tomorrow", "11/10/26"); counts are plain numbers.

## Do and don't

| Do | Don't |
| --- | --- |
| Put white panes and inset groups on the system grey | Frame content in bordered or shadowed cards |
| Give each list one colour, everywhere it appears | Colour rows or text at random |
| Keep the blue for actions and the yellow for the signature | Use the yellow for buttons or links |
| Use capsule buttons and round circles | Square buttons or square checkboxes |
| Keep toolbar icons black on glass | Blue toolbar icons |
| End sidebar rows with a plain grey count | Red badges or pills for counts |
| Use true black in dark mode, grouped rows in near-black | Blue-grey or brown dark modes |
| Use the same icon for the same action | Mix icon sets, or fill icons |
