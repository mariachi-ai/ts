# Nocturne

Category: calm and minimal. Dark-first and gentle: white type over night-blue scenes that wash from
blue into indigo, generous rounded tiles that carry their duration, white pill actions, outlined pill
chips with the chosen one filled white, a daily check-in and a streak. By day it turns into white
pages with deep-plum ink and one violet action. For sleep, meditation, wellbeing and audio apps that
should feel like a quiet night.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `nocturne` preset of `@mariachi/design` (`data-theme="nocturne"`,
`themes/nocturne.css`). Dark is the main mode: set `data-mode="dark"` unless the page is a light
marketing, help or article page.

## Principles

- **The night is the canvas.** Pages sit on a scene: a wash from the brand's blue (`#1d4a86`) at the
  top into the night indigo (`#1c2154`). Panels are a darker veil (`#171a3f`) laid over it, never a
  lighter card. Type is white; secondary lines are white softened to about 75%.
- **One white action.** The action that matters is a white pill with night-navy text. Everything else
  is an outlined pill, a round veil button or plain white text. On light pages the same action is
  violet (`#555be4`) with white text.
- **Content is the colour.** Colour comes from the tiles (art, scenes, covers), not from the chrome.
  Where there is no artwork, tiles use token gradients (sky to violet, violet to rose, mint to sky,
  yellow to rose), never photographs pulled from somewhere.
- **Slow and generous.** Large touch targets (44px controls, 52px main pills), roomy rows, light titles,
  and motion that fades and settles over 400ms.

## Foundations

| What | Light (pages, help, articles) | Dark (the app) |
| --- | --- | --- |
| Canvas | white `#ffffff` | night indigo `#1c2154` |
| Panels (surface) | white, on a soft wide shadow | a darker veil `#171a3f`, no shadow |
| Raised (menus, dialogs) | white | `#262b66` |
| Sunken (side menu, quiet panels) | chip grey `#f7f7f7` | deep navy `#0e1d45` |
| The scene wash (top of the page) | pale sky `#eef4fd` into white | the brand blue `#1d4a86` into the night |
| Text: default, muted, subtle | plum ink `#291a3c`, `#4f4763`, `#6b6580` | white, `#c6c8d4`, `#a4a6bb` |
| Hairlines | `#e6e4ec`; lighter `#f1f0f4` | white at 14% `#3c406c`; at 8% `#2e3362` |
| Field and control edges | `#8a8599` | white at 50% `#8e90aa` |
| Action | violet `#555be4`, white text | white `#ffffff`, night-navy text `#121331` |
| Links and accent icons | violet `#555be4` | periwinkle `#8fbcf2` |
| Brand | violet `#6461e0` (the sky-to-violet gradient's signature) | the same |
| Done, streak days | mint: text `#1a7a5c`, solid `#1d7d5f` | mint `#5fd0ac` with navy text |
| Tags and offers | yellow `#f7d32f` with dark text | the same |
| Failed | soft red `#b83a3a` on `#fdeeee` | `#ff9a9a` on `#3b1d3f` |

- **Radius.** Every button and chip is a pill. Fields are 8px. Mood and choice tiles, plan boxes,
  thumbnails and list art are 12px; session tiles 14px; cards and panels 20px; dialogs 24px.
- **Shadow.** On light pages a single soft, wide drop (`0 2px 24px` at 8% black); popovers add a
  violet-grey drop. On the night there are no shadows: depth comes from the veil and the scene.
- **Motion.** 200, 400 and 700ms with `cubic-bezier(0.4, 0, 0.2, 1)`. Things fade in and settle;
  nothing bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px between chips and inside a control group;
  - 12–16px between fields, tiles in a check-in grid and rows;
  - 24px between tiles and cards, and inside cards;
  - 40px between page sections, with a hairline between sections of tiles.
- **Layout.**
  - A 240px side menu in the deep navy, with no edge.
  - Content to 75rem, with a gutter of `clamp(1rem, 4vw, 3rem)`.
  - Settings and lists in 44rem; sign-up, plans and errors in a centred 28rem column, like a phone
    screen.
  - Tiles in rows: a grid of square tiles at least 9.5rem wide, 24px apart.
- **Density.** 1 by default; the language is airy on purpose. For a dense screen set
  `--m-density: 0.85`, but keep targets at 44px.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Figtree (variable, `@fontsource-variable/figtree`) for everything: body at 400,
  emphasis at 500, names and buttons at 600. Long reading (articles, stories, journal entries) may
  use Lora (`@fontsource-variable/lora`) through `--m-font-family-serif`. Roboto Mono only for codes.
- **Sizes:**
  - body 16px with a 1.5 line height; long reading 18px at 1.8;
  - secondary lines 14px; captions and small print 12px;
  - section titles 24px at 400 ("Picked for tonight");
  - page titles 32px at 400, tight leading ("Good evening, Priya");
  - marketing headlines 48px; on light pages they may go to 600.
- **Weight.** Titles over a scene are light (400). The names of sessions, buttons and the "New" tag
  are 600. Never bold a whole paragraph.
- **Case.** Sentence case everywhere. Tags on light article pages may be 11–12px tracked capitals
  (10%).
- **Durations.** "41 min", "8 hr", "3 parts, 32 min". Times in tabular figures ("11:04", "−20:56").

## Icons

- Lucide, outlined, **1.5px stroke**, rounded ends: 20–22px in the side menu, round buttons and rows;
  24–26px in check-in tiles and plan perks; 32–36px in empty states and error pages. The only solid
  marks are the play triangle (in duration chips and Play) and a saved heart.
- Accent icons (perks, settings rows, stats) take the link colour: periwinkle on the night, violet by
  day. Navigation icons stay white or ink.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (horizontal, in a round veil button), close `x`;
  - back `chevron-left` (in a round veil button), forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `rotate-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Progress** is a ring or a rounded bar: the brand violet (lighter `#8a88f0` on the night) on a quiet
  track. Rings can run the brand gradient (sky to violet).
- **More series** step through violet, sky, mint, coral, yellow and orchid.
- **Streaks** are a row of seven discs: mint with a tick for done days, a white edge for today, a
  hairline circle for days ahead. Totals sit under them with an accent icon, a 14px label and an 18px
  semibold figure.
- No gridlines; labels in muted 14px.

## States (every control)

- **Hover.** Outlined pills fill with a lighter veil (`#232861`); the white pill dims to `#e6e8f2`;
  rows and menu items take a lighter navy. On light pages, a pale violet tint. Nothing lifts.
- **Focus.** A 2px ring outside the control: white on the night, violet by day. On keyboard focus only;
  never remove it.
- **Pressed.** One step deeper than hover.
- **Selected and current.** A chip or segment filled white with night text; a menu row or tile edged
  in a 1.5px white line (`box-shadow: inset 0 0 0 1.5px var(--m-color-fg-default)`); a chosen plan
  box with a 2px white edge.
- **Disabled.** Half opacity. Say why nearby.
- **Error.** The field's edge turns soft red and the message replaces the help text below it, in
  14px. The words stay calm.
- **Loading.** Skeleton blocks in a lighter veil with a slow shimmer for tiles and rows; a button keeps
  its width and label with `aria-busy="true"`. Never a spinner over the whole page.

## Components

All 36 of the library's components, as Nocturne draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split`, the 240px side menu beside the scene;
- `m-container`, 75rem for home and lists, 44rem for settings, 28rem (`sm`) for sign-up, plans and
  errors;
- `m-grid`, for tile rows (9.5rem minimum, 24px gaps) and for cards (22rem);
- `m-stack` and `m-cluster` inside.

**Actions and forms**
- **Button.** Always a pill, weight 600, 44px by default, 52px (`lg`) for the main action and full
  width on narrow pages.
  - **Primary:** the white pill with night text (violet with white text by day). One per view.
  - **Secondary:** outlined: a dark veil with a half-white 1.5px edge on the night, white with a violet
    edge by day. Also the chips.
  - **Ghost:** white text only; quiet actions and icon buttons in rows (save, play a part).
  - **Danger:** a solid soft red, only to confirm a destructive step.
  - **Icon-only:** a round veil disc with no edge (back, close, search), 36px.
- **Input, textarea.** 52px, 8px radius, the dark veil with a half-white edge; the icon may sit inside
  on the left and a tick inside on the right once valid. Placeholder in the muted white.
- **Select.** The same box with a small chevron; in settings rows it is `sm` and narrow.
- **Field.** Label above in muted 14px (or visually hidden when the icon and placeholder say it), the
  control, then help or the error in 14px.
- **Checkbox, radio.** Round, 22px. Checked is the white disc with a navy tick or dot (violet by day).
- **Switch.** 52 × 32 with a white knob; on is the brand violet, off the half-white edge colour. It
  takes effect at once.

**Navigation**
- **Sidebar.** 240px on the deep navy, no edge. A plain wordmark at the top, then icon-and-label rows
  at 16px with 22px icons and roomy 12px padding. The current row is semibold with a 1.5px white edge
  and a 10px radius. Counts are small violet pills.
- **Navbar** (light pages). White, 80px tall, 14px ink links, the violet pill on the right; no edge.
- **Tabs.**
  - **Chip tabs** (the usual): a row of pills, the chosen one white (`m-button`, `data-variant="primary"`),
    the rest outlined.
  - **Underline:** white (ink) text with a 2px line under the current tab.
  - **Pill** (segmented): a veil track with a lifted indigo segment; by day a grey track with a white
    segment.
- **Breadcrumb.** Rare; a round back button and a centred title are preferred. If used: muted links
  with "›".
- **Pagination.** Round pills; the current page is the white pill. Prefer "See all" and scrolling rows.

**Data and content**
- **Card.** On the night: the veil, 20px radius, no border, no shadow, 24px padding. By day: white
  with the soft wide shadow. Card titles are 20px at 400, not bold.
- **Session tile** (built from the library). Square art with 14px corners; a "New" pill top left and
  a duration chip ("▶ 41 min", a veil pill with white 12px semibold text) bottom left; under it the
  name at 16px 600 and "Story · Tomas Reyes" in muted 14px.
- **Table.** Rarely needed; when it is: no frame, no header fill, muted 14px headers, roomy 16px
  rows on hairlines, a lighter veil on hover.
- **Badge.** Pills at 12px 600: neutral (indigo with white text on the night, pale sky with blue text
  by day), solid ("New": the white pill on the night, ink by day), and the yellow offer tag with
  dark text and a 6px radius.
- **Avatar.** Round, initials in white on indigo (violet on a pale tint by day).
- **Divider.** A white 14% hairline between sections and rows.
- **Accordion.** Rows on hairlines, the question at 18px regular, a chevron on the right.
- **Code, kbd.** Roboto Mono on the deep navy; keys are 6px-radius caps with a hairline. Rare in this
  language.
- **Prose.** 18px with a 1.8 line height, links in the accent text. Articles can switch to Lora.
- **Progress.** A rounded 4–8px bar in the violet on a quiet track; the player's scrubber is the
  `sm` bar with times under it.
- **Usage.** A label and amount over the same bar (minutes listened, offline storage).

**Feedback and overlays**
- **Alert.** A tinted, borderless 12px-radius panel in the tone's colour, a 20px icon, the title at 600
  and one calm line.
- **Toast.** A small white card with dark text on the night (ink with white text by day), 14px radius,
  the overlay shadow, one action ("Retry").
- **Dialog.** Raised indigo, 24px radius, 32px padding over a deep scrim; the title 24px at 400; the
  white pill last.
- **Popover and menu.** Raised indigo, 16px radius, 44px rows with a 10px radius; a destructive item
  in soft red at the end.
- **Tooltip.** The inverse: a white label with night text (ink with white by day), 8px radius.
- **Spinner.** A thin white ring; only inside buttons and small areas.
- **Skeleton.** Lighter-veil blocks at tile and text sizes with a slow shimmer.

**AI and chat**
- **Chat.** Messages on the scene; the person's own in an indigo bubble with a 20px radius, the
  assistant's as plain white text. Timestamps muted 12px.
- **Composer.** A veil box with a 20px radius and a 1.5px half-white edge that turns white while
  typing; send is the white round pill.
- **Thinking.** A muted line with a soft pulse. **Tool call:** a hairline row with a 20px icon, the
  tool name and a status badge.
- **Citation.** A small indigo pill with a number; the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns soft red and the message replaces the help text. Validate on blur
  and on submit, never while typing.
- **In a form:** a danger alert above the form that says what was not done ("Nothing on your account
  changed"); focus moves to it.
- **Somewhere else:** a white toast with what happened and one action ("“Slow Tide” didn’t download ·
  Retry").
- **A whole page:** centred in the 28rem column on the scene:
  - a 72px veil disc with a 32px muted icon, the code in small mono, a 24px title at 400, one kind
    sentence and one or two pills;
  - **404:** "We can’t find that page" with Back to Today;
  - **500:** "Something went wrong on our side", "Nothing was lost", with Try again;
  - **403:** "This one is for members" with Start free trial.
- **Words.** Gentle and plain: say what happened, that nothing was lost, and what to do. No blame, no
  exclamation marks, no codes in sentences.

## Page shapes (recipes)

- **Dashboard.** Round search and reminder buttons and the avatar top right; "Good evening, Priya" at
  32px; the check-in card (a light question and a 3-column grid of mood tiles, the chosen one edged
  white) beside the streak card (seven discs and three totals); the player; then rows of session
  tiles under section titles with "See all", hairlines between rows.
- **List and detail.** A round back button with the title centred; a row of chips; new tiles; a list
  of sessions (art, name, kind · by · length, a heart). The open session sits beside it: art across the
  top, the title at 24px, the narrator, the white Play pill beside an outlined one, the blurb and its
  parts.
- **Onboarding.** Centred on the scene: back, the step and Skip; a thin progress bar; a light question
  with outlined choice tiles (chosen ones edged white with a tick); then fields with their icon inside
  and a full-width white Continue, with the fine print under it.
- **Settings.** The profile header, chip tabs, then groups of rows on veil cards: an accent icon, the
  label, and a value with a chevron, a switch or a small select. Deleting the account comes last with
  the danger pill.
- **Empty state.** A veil disc with a thin heart, a 24px light heading, one kind sentence, the white
  pill and an outlined one.
- **Pricing.** The plan screen in the narrow column: a close button, a short semibold line, a light
  32px heading, perks as icon rows on hairlines, plan boxes (the chosen one with a 2px white edge and
  the yellow tag), the full-width white pill, the small print, and questions below.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Warm, short and plain, sentence case: "Wind down", "Picked for tonight", "Start my free trial".
- Talk about nights and moments, not usage: "4 nights in a row", "One tap. It shapes what we suggest
  next."

## Do and don't

| Do | Don't |
| --- | --- |
| Put pages on the night scene and panels on the darker veil | Lighter grey cards on the night, or flat black |
| Make the one action a white pill | Violet or gradient pills on the night |
| Keep titles light (400) and names at 600 | Bold headings over scenes |
| Give tiles their duration chip and 14px corners | Sharp-cornered tiles, or durations only in text |
| Mark the chosen chip white and the current row with a white edge | Coloured fills for selection |
| Use token gradients where there is no artwork | Photographs, illustrations or logos taken from elsewhere |
| Keep targets at 44px or more | Dense 32px controls |
