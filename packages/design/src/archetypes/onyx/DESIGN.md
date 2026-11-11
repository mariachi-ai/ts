# Onyx

Category: bold and fast. Near-black type on a pale grey screen, white widgets with 16px corners and
no border or shadow, one blue-violet for every action, heavy wide headings, balances set huge with
small cents, pill buttons, round action buttons with labels underneath, and grey filled fields. Pure
black is the dark mode, and the brand colour. For consumer money apps that should feel fast, bold
and in control: banking, payments, trading.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `onyx` preset of `@mariachi/design` (`data-theme="onyx"`, `themes/onyx.css`).

## Principles

- **Big and certain.** The number that matters is the biggest thing on the screen: a balance at
  56px, heavy, with the cents at half size. Headings are bold and tight. Nothing is light or timid.
- **Widgets on grey.** The screen is the grouped grey `#f7f7f7`; content sits in white widgets with
  16px corners, no border and no shadow. Rows inside a widget aren't separated by lines; space and
  round icons do it.
- **One colour acts.** The blue-violet `#4f55f1` fills the primary pill, colours the secondary pill's
  text on its pale background, and marks the current nav item. Everything else is ink, grey and
  white; money in is teal-green.
- **Round things you press.** Buttons are pills; quick actions are 40px circles with the label
  underneath; checkboxes, avatars and filter chips are round.
- **Black for the brand.** Marketing bands and hero panels are black (`color.brand.default`), with
  all-caps heavy headings on them. Dark mode is pure black with grey widgets.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | the grouped grey `#f7f7f7`; widgets white `#ffffff`; popovers white | black `#000000`; widgets `#161618`; popovers `#242426` |
| Text: default, muted, subtle | `#191c1f`, `#505a63`, `#717173` | `#f4f4f4`, `#c9c9cd`, `#a1a1a3` |
| Hairlines | `#e2e2e7` (the separator); lighter `#ebebf0` | `#3b3b3d`; `#272729` |
| Grey fill: fields, filter chips, round icons, segmented track | `#ebebf0`; hover `#e2e2e7` | `#1c1c1e`; hover `#272729` |
| Action | `#4f55f1`; hover `#494ede`, pressed `#4348cd` (8% and 15% black over it) | fill `#5560f0`; text `#667dff` |
| Action background (secondary pills, avatars, info) | `#edeefd` with `#4348cd` text | `#1c1d34` with `#8c99ff` |
| Brand | black `#191c1f` with white | `#0e0e0f` with white |
| Money in, success | teal `#00b88b` (fills, with ink on it); text `#007a5c` | `#1ac097` |
| Errors | red `#e23b4a` (borders); text `#c8303f` on the pale `#feedec` | `#ee4a59`; text `#ff6b78` on `#330e0c` |
| Warning | orange `#ec7e00` (fills, with ink on it); text `#a35600` | `#ff9f0a` |

- **Radius.** 8px for small parts, 12px for inner corners (menu rows, tooltips), 16px for widgets,
  fields, dropdowns, toasts and nav items, 24px for dialogs. Buttons, tags, chips, checkboxes and
  avatars are round.
- **Shadow.** None on widgets. Four published levels: `0 2px 3px` at 5%, `0 3px 8px` at 10%,
  `0 3px 30px` at 8%, and `0 16px 64px` at 12% for overlays (toasts, popovers, dialogs). In dark mode,
  a faint 1px ring and a deep drop for overlays only.
- **Motion.** 200, 300 and 450ms on `cubic-bezier(0.15, 0.5, 0.5, 1)`, a fast start and a soft stop.
  Toasts arrive on an overshoot, `cubic-bezier(0.175, 0.885, 0.21, 1.65)`. Skeletons shimmer over
  1.5s.
- **Spacing.** A 4px unit (2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72). The usual gaps are:
  - 16px inside a widget and between widgets;
  - 12px between a row's icon and its text, 16px row padding;
  - 24px between groups of widgets, 8px from a grey subheader to its widget.
- **Layout.**
  - A 248px side menu on the grouped grey, no edge line.
  - A round search field across the top.
  - Content to 58rem (928px) for the dashboard and lists, 32rem (512px) for settings and other
    single lists, 25rem (400px) for forms; gutter `clamp(1rem, 3vw, 2rem)`.
  - Detail opens in a 25rem side panel beside the list.
- **Density.** 1 by default; set `--m-density: 0.85` on dense data screens.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.**
  - **Inter** for everything you read and press: 400 body, 500 for titles, labels and buttons, 600
    for small emphasis. Load `@fontsource-variable/inter`.
  - **Figtree** (`@fontsource-variable/figtree`) for page titles, balances and marketing headings,
    at 700, and 900 in capitals on brand bands.
- **Mono.** Roboto Mono, only for codes and references, small.
- **Sizes** (the published text styles):
  - 16px body with a 1.375 line height, 14px secondary lines, 12px tags and hints;
  - 20, 24 and 32px headings at 700, tight leading;
  - 44 and 56px display for balances and heroes.
- **Tracking.** Slightly tight everywhere (about −1% on body, more on headings); all-caps headings
  sit at 0.
- **Figures.** Tabular. A hero balance puts its cents at half size on the baseline, same weight:
  `$12,480.52` with `.52` small. Money in takes a plus and the teal; money out a minus in ink.
- **Case.** Sentence case in the product. All-caps only for marketing display headings, at 900.

## Icons

- Lucide, outlined, **2px stroke** (the reference's own icons are filled glyphs of about that
  weight). 20px in navigation, buttons and rows; 16–18px inside small pills; 28–32px inside big round
  icons.
- **Round icons.** A row's icon sits in a 40px circle tinted by kind (the grey fill, the action
  background, or a status tint, with the icon in the matching colour); a status screen's in a 72px
  circle.
- Every nav item carries an icon; list rows lead with a round icon or an initials avatar.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal, in a round button), close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `rotate-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** a 2px line in the action colour, no area, no gridlines; or bars with round 8px tops
  in the grey fill, the current one in the action colour.
- **More series** step through blue-violet, teal, pink, orange, light blue and purple.
- Change sits under the figure: `+$33.20` and a small up triangle in teal, never colour alone.
- Tooltips use the tooltip treatment: a white chip on a soft shadow.

## States (every control)

- **Hover.** A state overlay, not a new colour: 8% black over the primary, 5% over the secondary;
  rows and nav items take the grey fill. Widgets don't move or lift.
- **Focus.** A 2px ring in the action colour, 2px outside the control, on keyboard focus only. Never
  remove it.
- **Pressed.** 15% black over the primary, 10% over the secondary. Nothing scales.
- **Disabled.** Half opacity; say why nearby.
- **Error.**
  - The field's border turns red, and its message replaces the hint below, in red 14px.
  - It says how to fix it ("Routing numbers have 9 digits. This one has 7.").
- **Loading.**
  - A button keeps its width; `aria-busy="true"` swaps the label for a small spinner.
  - Lists show round-ended shimmer bars and 40px circles where icons go; widgets show 16px blocks.
- **Selected and current.** The current nav item is a white widget with action-coloured text. A
  segmented control is a grey round track with a white round segment. Checked controls fill with
  the action colour.

## Components

All 36 of the library's components, as Onyx draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 58rem, 32rem for settings, 25rem for forms;
- `m-split`, the 248px side menu beside the content;
- `m-grid`, for widgets: 16px gaps, 20rem columns;
- `m-stack` and `m-cluster`, for everything inside.

Groups of widgets are 24px apart.

**Actions and forms**
- **Button.** A pill at weight 500, in three heights: 30px (`sm`) in bars, 40px by default, 52px
  (`lg`) for the main action of a form, full width.
  - **Primary:** the action colour with white text, one per view.
  - **Secondary** (the default): the pale action background with action-coloured text.
  - **Ghost:** action-coloured text alone; round ghost icon buttons in bars.
  - **Danger:** the pale red with red text; red is never a solid fill on a button.
  - **Icon-only:** a 40px circle, the quick actions, with the label underneath outside the button.
- **Input, textarea.** A grey filled box, 56px tall, 16px corners, 16px text, with a thin grey edge
  (the library's 3:1 floor). It turns action-coloured on focus and red when invalid. The search field
  is the same box at 40px, fully round, with the search icon inside.
- **Select.** The same grey box with a chevron. Filters above a list are 40px round selects in a row.
- **Field.** The label above in grey 14px, the control, then the hint or the error in 12–14px. Fields
  stack 16px apart; short pairs (first and last name) share a row.
- **Checkbox, radio.** 24px circles with a 2px grey edge, filled with the action colour and a white
  mark when on.
- **Switch.** 48 × 28px, a 24px white knob, the action colour when on and the grey when off. It acts
  at once; no Save.

**Navigation**
- **Sidebar.** 248px on the grouped grey, no edge.
  - Top: the person's avatar and name, opening the account switcher.
  - Items are 16px with a 20px icon, 12px by 16px padding and 16px corners. The current one is a
    white widget with action-coloured text; hover is the grey fill.
  - Group headings in grey 14px; counts are small red rounds with white numbers.
- **Navbar** (public pages). White, 72px, the links in ink 16px at 500 as pills, a grey pill for the
  current one; a primary pill at the right.
- **Top bar** (in the app). No fill: the round search field on the left, round ghost icon buttons on
  the right.
- **Tabs.**
  - **Pill** (the usual one, the segmented control): a grey round track, the current segment a
    white round pill in ink, the rest in grey at 500.
  - **Underline** (the web app's): grey 16px labels at 500, the current one in the action colour
    over a 2px line of it, on a hairline across the column.
- **Breadcrumb.** Grey links with "›", the current page in ink. In the app a back arrow is preferred.
- **Pagination.** Round 40px numbers in ink, the current one an ink circle with white. In lists,
  prefer "View all" and loading more.

**Data and content**
- **Table.** Only for business data: inside a white widget, grey 14px headers in sentence case, rows
  on the lightest hairline, a grey hover, amounts right-aligned. Lists of money are rows, not tables.
- **Card** (the widget). White, 16px corners, no border, no shadow, 16px inside. A grey 14px
  subheader sits above it or as its first line. A clickable widget takes a soft shadow on hover.
- **Badge** (the tag). A 24px round pill, 12px at 500: grey with ink, a tone's tint with its text,
  or solid ink with white for a plan name.
- **Avatar.** Round: 32, 40 and 56px (76px on a profile), initials at 600 in the action colour on
  its pale background. A merchant without a logo gets a round icon instead.
- **Divider.** The separator `#e2e2e7`, used sparingly: widgets separate themselves.
- **Accordion.** Rows in a white widget, the question at 16px 500, a chevron on the right.
- **Code, kbd.** Roboto Mono on the grey fill, 8px corners inline and 16px for blocks.
- **Prose.** 16px Inter, 1.375 line height, about 40rem wide, links in the action colour.
- **Progress.** A 4px round bar in the action colour on the light grey track.
- **Meter.** The same bar; red past the high mark.
- **Usage.** A label and amount over a round bar, figures tabular.

**Feedback and overlays**
- **Alert** (the notice). A tinted 16px panel in the tone's pale colour, no border, a 20px status
  icon, the title at 600 and the body in the tone's text colour. Danger notices say what didn't
  happen ("Nothing left your account").
- **Toast.** A white 16px card on the overlay shadow, 56px tall, ink text with a grey second line,
  a status icon at the start and one small pill ("Retry", "Undo"). It arrives with a little
  overshoot.
- **Dialog** (the popup). The grouped grey with 24px corners, 24px inside, over a 40% black scrim.
  The title is 24px bold; actions are full-width pills stacked, primary first. On phones it is a
  bottom sheet.
- **Popover and menu** (the dropdown). White, 16px corners, the overlay shadow; 44px rows with 12px
  inner corners, the grey fill on hover, a 20px icon in the action colour; a destructive row in red.
- **Tooltip.** A white chip with ink 14px text, 12px corners and a soft shadow; no arrow.
- **Spinner.** A ring in the action colour, inside buttons and small areas only.
- **Skeleton.** Round-ended shimmer bars and circles at text and icon sizes, 16px blocks for
  widgets.

**AI and chat**
- **Chat.**
  - The other side on a white bubble (a grey widget in dark), your own on the grey `#e2e2e7`, 16px
    corners, right-aligned.
  - Times sit inside the bubble, small and grey; days are centred grey labels.
- **Composer.** A white round-cornered bar (24px), the placeholder in grey, an action-coloured border
  while typing, and a round primary send button with the `send` icon.
- **Thinking.** A grey line with a soft pulse. **Tool call:** a 16px widget row with a 20px icon,
  the tool name and a round status tag.
- **Citation.** A small round pill on the action background with a number; the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the grey box gets a red border and the message replaces the hint. Validate on blur
  and on submit, never while someone is typing.
- **In a form:** a danger notice above the form saying what didn't happen and how many fields need
  fixing ("This payment didn't go out. Nothing left your account. Fix the 2 fields below."). Focus
  moves to it.
- **Somewhere else:** a toast with what failed and one action ("Couldn't load your statements ·
  Retry").
- **A whole page** (the status screen): centred in a white widget.
  - A 72px round icon (grey for not found, red for failure, the action background for access), the
    code small in mono, a 32px bold title, one sentence, and full-width stacked pills.
  - **404:** "We can't find that page" with Back to Home.
  - **500:** "Something broke on our side", saying nothing changed and no money moved, with Try again
    and Chat with us.
  - **403:** "This account isn't yours to see" with Ask for access.
- **Words.** Say what happened, whether money moved, and what to do next. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - A hero panel: the action colour fading to the brand black, the account's name small, the balance
    at 56px with half-size cents, and an "All balances" pill.
  - Four round actions with labels: Top up, Transfer, Card, Options.
  - Underline tabs, then a row of balance cards: the currency's name and code, a round symbol
    on the right, and the amount bold with small cents.
  - White widgets: recent rows with "View all", a spending bar chart, a savings goal with a progress
    bar and today's interest in teal.
- **List and detail.**
  - The title and a secondary pill; a white search field across the column, then round filter
    selects in a row.
  - Rows grouped by day, each day a white widget under a grey subheader with the day's total.
  - The selected row opens a 25rem side panel: a round icon, the amount large, round actions, then
    label-and-value rows and a red "Report a problem".
- **Onboarding.** One 400px column: a back arrow beside a thin progress bar, a 32px bold heading,
  grey filled fields, and a 52px full-width primary pill.
- **Settings.** A 32rem column: a centred profile (76px avatar, name, handle, a plan tag), round
  quick actions, then grouped widgets of rows with tinted round icons, chevrons and switches;
  closing the account last, as a danger pill.
- **Empty state.** A white widget: a round action-coloured icon, a short bold heading, one sentence, a
  primary and a secondary pill.
- **Pricing.**
  - A black brand band: an all-caps 900 heading, one line, and a segmented Monthly / Yearly switch.
  - Four plan widgets: name, a big price with "/month", one line, a full-width pill (primary on the
    highlighted plan, which carries a tag) and ticks in the action colour.
  - Questions below in an accordion.
- **Errors.** The field, form, toast and status-screen errors above, as one page.

## Words

- Short, direct, second person, sentence case: "Top up", "View all", "Ask for access".
- Figures exact, with signs: `+$38.00`, `−$64.20`. Dates short ("Today, 12:14", "Monday, Nov 9").

## Do and don't

| Do | Don't |
| --- | --- |
| Set the balance huge and heavy, cents at half size | Show the main figure at body size, or light |
| Put content in white 16px widgets on the grey | Draw borders or shadows around widgets |
| Make buttons pills and quick actions 40px circles | Square buttons, or outlined primaries |
| Use the action colour for actions only | Colour headings, icons or backgrounds with it for decoration |
| Lead rows with a round icon or initials | Use dividers between rows inside a widget |
| Show money in with a plus in teal | Use red for money going out |
| Use black bands and all-caps 900 headings for marketing | Use all-caps inside the product |
| Use the same icon for the same action | Mix icon sets or change stroke weights |
