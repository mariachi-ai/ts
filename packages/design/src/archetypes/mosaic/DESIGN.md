# Mosaic

Category: content-first. The pictures are the page: near-black ink on white, a masonry of image
tiles with 16px corners, one saturated red for the action that matters (Save, Follow, Join), grey
pills for every other action, solid black for whatever is selected, and big friendly corners (32px
on dialogs and detail cards). Type is a round, bold grotesque. For visual discovery apps:
collections, moodboards, recipes, shopping and creators.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `mosaic` preset of `@mariachi/design` (`data-theme="mosaic"`,
`themes/mosaic.css`).

## Principles

- **The content is the hero.** Pictures fill the screen edge to edge in a masonry grid. Chrome is
  white, flat and quiet: no panels, no borders, no tinted backgrounds behind content.
- **Red means save.** The red pill is the one action that adds something: Save, Follow, Join, Next,
  Create. One per view, two at most (a hovered tile's Save beside the page's own).
- **Black means selected.** The current nav pill, the chosen chip, the checked box, the switch that's
  on and the current settings row are solid near-black with white text. Never red.
- **Round and bold.** Every button is a pill; tiles, fields and menus have 16px corners; dialogs and
  detail cards 32px. Headings are bold and slightly tight.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | white `#ffffff` everywhere | `#111111`; cards `#212121`; menus and dialogs `#2b2b2b` |
| Text: default, muted, subtle | `#111111`, `#5f5f5f`, `#767676` | `#ffffff`, `#cdcdcd`, `#a5a5a5` |
| Grey pill (secondary actions, chips) | `#e9e9e9`, hover `#e2e2e2`, pressed `#dadada` | `#4a4a4a`, `#535353`, `#666666` |
| Quiet fill (segmented track, hovered rows, skeletons) | `#efefef` | `#404040` |
| Red (primary, brand) | `#e60023`, hover `#b60000`, pressed `#a3081a` | the same |
| Selected | `#111111` with white text | `#efefef` with `#111111` text |
| Dividers; control edges | `#cdcdcd` and `#e9e9e9`; `#767676` | `#4a4a4a` and `#2b2b2b`; `#a5a5a5` |
| Focus ring | `#2696ff`, 4px, no gap | `#75bfff` |
| Error, success, warning, info text | `#cc0000`, `#005f3e`, `#aa4900`, `#004ba9` | `#f47171`, `#39d377`, `#fdc900`, `#abdbff` |

- **Radius.** 4px for badges and inline code; 8px for checkboxes, menu rows, nav rows and tooltips;
  16px for image tiles, fields, menus, alerts and toasts; 32px for dialogs and the detail card. Every
  button and chip is a pill; avatars are circles.
- **Shadow.** Almost none. Menus and hovered tiles float on a faint all-round glow
  (`0 0 8px` at 10%); the detail card has a long soft one (`0 1px 20px` at 10%). Sticky bars cast a
  short shadow upward. In dark mode, surfaces step lighter instead.
- **Motion.** 150, 250 and 400 ms. Things ease out smoothly; a pressed button shrinks to 97%.
- **Spacing.** A 4px unit. The usual gaps are:
  - 16px between masonry tiles (both ways) and between fields;
  - 8px between pills in a row;
  - 24–32px inside cards and dialogs;
  - 40–48px between page sections.
- **Layout.**
  - An 80px white top bar: the round red mark, nav pills, a long grey search pill, then icon
    buttons and the avatar.
  - The feed runs the full width in columns of about 236px (at least 160px) with 16px gutters.
  - Forms sit in a 488px column; settings put a 240px list of sections beside it.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.85` on the page; controls and
  padding shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Albert Sans (variable, `@fontsource-variable/albert-sans`) for everything: a round
  grotesque with a big x-height that stands in for the reference's custom face. Roboto Mono for
  codes.
- **Sizes** (the reference's own scale):
  - 12px for labels, meta lines and tooltips;
  - 14px for tile titles, comments and secondary text;
  - 16px for body, buttons, fields and nav;
  - 20px for section titles ("More to explore");
  - 28px for page and idea titles;
  - 36px for profile names and big questions;
  - 48px and 70px for marketing headlines only.
- **Weights.** 400 for body; 600 for buttons, nav and tabs; 700 for every heading, tile title and
  name. Headings are tracked −0.5px (−0.014em) with a 1.1 line height.
- **Case.** Sentence case everywhere. No capitals for labels.

## Icons

- Lucide, outlined, at a heavy **2.25px stroke**: the reference's own glyphs are solid, so the
  stroke stays heavy to match their weight. 20px in buttons, bars and rows; 16px inside small
  pills and beside small text; 32px on full-page errors.
- Icon-only buttons are round: ghost in bars (bell, messages, more), grey or white over pictures.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (horizontal, in a round button), close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.
- Share is the arrow out of a tray (`share` in Lucide); a link out to a site is `arrow-up-right`.

## Charts

- Bold, flat series with no gridlines except a faint `#e9e9e9` baseline; labels 12px.
- **Series order** (the reference's data-visualisation palette): navy `#003c96`, teal `#11a69c`,
  violet `#924af7`, amber `#d17711`, blue `#0081fe`, pink `#ff5383`. A single series is the blue.
- Big numbers in stat tiles are 28px bold; changes sit under them in green or red text with an arrow.
- Tooltips use the near-black tooltip.

## States (every control)

- **Hover.** Fills deepen one step: grey `#e9e9e9` to `#e2e2e2`, red `#e60023` to `#b60000`; ghost
  buttons and rows gain a faint grey. A picture tile darkens (black at 40%) and shows its actions:
  the collection picker and red Save on top, the site link and round Share and More below.
- **Focus.** A wide 4px blue ring hugging the control (`--m-color-border-focus`), on keyboard focus
  only. Never remove it.
- **Pressed.** One step darker again, and the button shrinks slightly (97%).
- **Disabled.** Half opacity; a disabled red pill stays recognisably red but flat. Say nearby what
  unlocks it ("3 picked · 2 to go").
- **Error.**
  - The field's 2px edge turns red.
  - A red 12px message with an alert icon replaces the help text under the field.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a spinner.
  - Feeds show grey tiles at the real tiles' sizes (skeletons with 16px corners), never a page
    spinner.
- **Selected and current.** Solid near-black with white text: chips, nav pills, settings rows,
  checkboxes, switches, radio buttons, pagination. A tab is marked by a 3px black bar.

## Components

All 36 of the library's components, as Mosaic draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: up to 84rem, or 50rem and 30.5rem (488px) for forms;
- `m-split`, a 240px side column beside the main one;
- `m-grid`, for tiles: 16px gaps and 14.75rem (236px) minimum columns;
- `m-stack` and `m-cluster`, for everything inside.

The masonry itself is CSS columns (`columns: 6 10rem; column-gap: var(--m-space-4)`) with
`break-inside: avoid` on each tile.

**Actions and forms**
- **Button.** Always a pill, weight 600, 16px text. 48px (`lg`) is the everyday size; 40px by
  default; 32px (`sm`) for chips and over pictures.
  - **Primary:** solid red, white text. Save, Follow, Join, Create, Next.
  - **Secondary** (the default): the grey pill, ink text, no border.
  - **Ghost:** transparent, for icon buttons in bars and the collection picker.
  - **Danger:** solid deep red; most destructive confirms use the primary red instead.
  - **Selected:** a chip or toggle that's on is solid black with white text.
  - **Icon-only:** a round button with an `aria-label`.
- **Input, textarea.** 48px, 16px corners, a 2px grey edge that darkens on hover, white inside, the
  blue ring on focus. Placeholders in subtle grey. Search is different: a grey pill with no edge and
  a search icon inside.
- **Select.** The same 48px box with a chevron.
- **Field.** A 12px label above, the control, then help or the error in 12px below. Fields stack 16px
  apart; short pairs (first and last name) sit side by side.
- **Checkbox, radio.** 24px; the checkbox has 8px corners. A 2px grey edge at rest, solid black when
  checked, with a white tick or dot.
- **Switch.** 40 by 24. Black when on, grey when off, with a white knob. It takes effect at once, or
  with the page's Save bar in settings.

**Navigation**
- **Navbar.** White, 80px, no edge. The round red mark, then nav pills (the current one solid black,
  the rest ghost), a long grey search pill filling the middle, and round ghost icon buttons
  (notifications with a red dot, messages), the avatar and a chevron for accounts. On public pages
  the right side is a grey "Log in" and a red "Join" pill.
- **Sidebar.** Plain rows of 16px text with no icons, 8px corners and 2px between them; the current
  row solid black with white text; hovered rows grey. No edge, no fill. Headings, when needed, are
  16px bold.
- **Tabs.**
  - **Underline:** ink text at 600 and a 3px black bar under the current tab.
  - **Pill** (the segmented control): a `#efefef` track with 16px corners and 4px padding; the
    chosen segment is white with 12px corners.
- **Breadcrumb.** Ink links with "/" between and the current page in bold. Prefer a round back button
  in the app.
- **Pagination.** Round ghost buttons, the current one solid black. Feeds don't paginate; they load
  more as you scroll.

**Data and content**
- **Card.** No border and no shadow at rest: content sits straight on the page, with 16px corners.
  A tile's title is 14px bold under the picture, then the person's avatar and name. The detail
  card is white with 32px corners and the long soft shadow. A clickable card gains the faint glow
  on hover. Plan panels are the quiet grey fill with 32px corners.
- **Table.** No frame, no header fill: bold 14px headers, rows on `#e9e9e9` hairlines, hovered rows
  in the quiet fill. Rows sit 12px tall in padding; numbers right-aligned.
- **Badge.** 20px tall, 4px corners, bold 12px. Solid (`data-variant="solid"`) is the reference's
  look: white text on black, red, green or blue. The tinted default is for quieter labels.
- **Avatar.** A circle on the quiet fill with a bold initial; 24, 32 and 48px, and 72–120px on
  profiles. Overlapping avatars get a white ring.
- **Divider.** A `#e9e9e9` hairline; rarely needed, since space separates things.
- **Accordion.** Rows on hairlines, the question 20px bold, a chevron on the right; no fill.
- **Code, kbd.** Roboto Mono on the quiet fill: 4px corners inline, 16px for blocks. Keys are grey
  with 8px corners.
- **Prose.** 16px with a 1.5 line height, about 66 characters a line; links are ink and underlined.
- **Progress.** A black bar on the `#efefef` track, rounded; 8px by default.
- **Meter.** The same bar; it turns red past the high mark.
- **Usage.** A bold label and amount over a black meter bar.

**Feedback and overlays**
- **Alert.**
  - A pale tint of the tone, 16px corners, no border, 16 by 24px padding.
  - A 20px status icon, a bold title and the message.
  - Error alerts sit above the form and say what wasn't done ("Nothing was created yet").
- **Toast.**
  - Near-black with white text, 16px corners, at the bottom centre.
  - A small picture of the saved idea first, a bold line, then one grey pill ("Undo", "Try again").
  - Success toasts go after 5s; failures stay until dismissed.
- **Dialog.**
  - White, 32px corners, over an 80% black scrim.
  - A centred bold 28px title and centred text.
  - Grey Cancel and red confirm pills, 48px; a destructive confirm says what goes with it.
- **Popover and menu.**
  - White, 16px corners, the faint glow, 8px inner padding, no hairlines between groups.
  - 44px rows with 8px corners, 16px text, a grey hover; group labels 12px.
- **Tooltip.** Near-black with white 12px text, 8px corners, no arrow; it appears after 300ms.
- **Spinner.** A 3px ink ring. Use it in buttons and small areas only.
- **Skeleton.** Grey tiles at real sizes with 16px corners and a soft shimmer that stops under
  reduced motion.

**AI and chat**
- **Chat.**
  - Your own messages in grey bubbles with 24px corners, right-aligned; others in white with a
    hairline.
  - The assistant's avatar is the red brand circle; people get initials on grey.
- **Composer.** A white box with 24px corners, a 2px grey edge and the faint glow. Send is a round
  red button.
- **Thinking.** A muted line ("Finding ideas…") with a soft pulse. **Tool call:** a hairline row with
  16px corners, a 20px icon, the tool name and its status.
- **Citation.** A small grey pill with a number; it turns black on hover and shows the source in a
  menu.
- **Usage**, as above.

## Error handling

- **In a field:** the 2px edge turns red and a red 12px message with an alert icon replaces the help
  text. Validate on blur and on submit, never while someone is typing.
- **In a form:** a red-tinted alert above the form says how many things to fix and that nothing
  happened yet ("Two things to fix. Nothing was created yet."). Focus moves to it.
- **Somewhere else:** a near-black toast with what happened and one action ("Couldn’t save to Clay
  and glaze · Try again").
- **A destructive action:** a dialog that names what goes with it, Cancel in grey and Delete in red.
- **A whole page:** centred: a 32px icon in a 64px grey circle, the code in small mono, a 28px bold
  title, one sentence and one or two 48px pills.
  - **404:** "We couldn’t find that page" with Go to your feed.
  - **500:** "Something went wrong on our end" and "Nothing you saved was lost", with Try again.
  - **403:** "This collection is secret" with Ask to join.
- **Words.** Say what happened, whether anything was lost, and what to do next. Friendly and short;
  no codes in sentences, no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard** (the home feed).
  - The top bar with the current nav pill in black.
  - A row of topic chips (grey pills, the current one black).
  - The masonry: 16px-cornered tiles, a bold title and the person's avatar and name under some.
    One tile shown hovered: darkened, a collection picker and red Save on top, the site link and
    round Share and More below.
- **List and detail.**
  - A round back button, then one idea in a white 32px card: the picture on the left; on the right
    round actions, the collection picker and red Save, the source link, a 28px title, the
    description, the author with a grey Follow pill, comments and a comment pill.
  - "More to explore" centred at 20px, then the masonry again.
- **Onboarding.** A centred 36px question, then square picture tiles named in bold white; a picked
  tile darkens and shows a white tick. A bottom bar (fixed to the window in an app) holds Back and the red Next, disabled with
  "2 to go" until enough are picked.
- **Settings.** A plain list of sections with the current one solid black, a 488px column with a
  28px title, the photo with a grey Change pill, 48px fields and switch rows, and a bottom bar (fixed in an app) with
  Reset and a red Save.
- **Empty state.** The profile with nothing saved: a 120px avatar, a 36px name, grey Share and Edit
  pills, underline tabs, a grey three-tile collection cover, a bold line, one sentence and a red Find
  ideas pill beside a grey one.
- **Pricing.** The public bar with Log in and Join, a bold centred headline, a segmented
  Monthly/Yearly switch, three 32px plan panels on the quiet fill (the chosen one on the pale brand
  tint, with a black "Most chosen" badge), a comparison table and questions.
- **Errors.** The field, form, toast, dialog and full-page errors above, as one page.

The recipes' navigation (Discover, Studio, Shop; Your profile, Alerts, Feed preferences…) and all
their content are made up; build your own from the same parts.

## Words

- Short, warm and plain, in sentence case: "Save", "Find ideas", "More to explore", "2 to go".
- Ideas, collections and people are named, not counted, where possible.

## Do and don't

| Do | Don't |
| --- | --- |
| Let pictures fill the page in a masonry with 16px gutters | Box content in bordered panels or tinted cards |
| Keep red for the one action that adds something | Use red for links, selection or decoration |
| Show selection in solid black | Mark the current item in red or with a coloured tint |
| Make every button a pill | Square buttons, or outlined pills |
| Round tiles, fields and menus at 16px and dialogs at 32px | Mix in small 4–6px corners on big surfaces |
| Set headings and names bold | Light or thin headings |
| Use placeholders or real user pictures, never stock filler with text baked in | Put text over pictures without darkening them |
