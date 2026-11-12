# Fennel

Category: calm fintech. Plain and confident: near-black text on white, forest green for every control
and link, one bright lime pill for the action that matters, soft green-grey fills in place of borders
and shadows, list rows led by icon circles, and heavy condensed capitals for the big moments. For money
apps that should feel open and on your side: payments, transfers, multi-currency accounts.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `fennel` preset of `@mariachi/design` (`data-theme="fennel"`,
`themes/fennel.css`).

## Principles

- **Plain first.** White pages, near-black text, generous 48px controls and short sentences. Nothing
  is decorated: no borders where a fill will do, no shadows on things that sit on the page.
- **Two greens with two jobs.** Forest green (`#163300`) is the interactive colour: links, checked
  controls, tab lines, focus rings, progress. Bright lime (`#9fe870`) fills the primary pill and
  nothing else, always with forest-green text on it. Never put white text on lime or lime text on
  white.
- **One lime pill per screen.** The action that matters is lime; the rest are pale lime pills, or
  forest-green text with an underline.
- **Loud only where it counts.** Big marketing lines and big money figures use the heavy condensed
  display face, in capitals for headlines. Everything inside the product is the text face at 400 and
  600.
- **Rows, not tables.** Activity, settings and choices are list rows: a 48px icon circle, a bold
  title with a muted line under it, and the amount or a chevron on the right.

## Foundations

**Brand colour** (`--m-color-brand-default`): the bright lime `#9fe870` with forest-green text, for hero bands, brand panels and the logo tile. It's not the action colour (forest green) and never text on the page.

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | white `#ffffff`; raised `#ffffff` | screen `#121511`, raised `#1e211d` |
| Text: default, muted, subtle | `#0e0f0c`, `#454745`, `#6a6c6a` | `#f3f5f1`, `#e8ebe6`, `#cacfc7` |
| Neutral fill: cards, hovers, current nav, skeletons | `#edefeb` (forest green at 8%), hover `#e1e5de`, pressed `#d5dad1` | `#2a2d29`, `#414441`, `#5a5c59` |
| Hairlines | `#e2e2e2` (near-black at 12%) | `#414441` |
| Control rings | `#868685`, hover `#6c6c6b` | `#b9bab7` |
| Interactive (accent) | forest green `#163300`, hover `#0d1f00` | bright lime `#9fe870` |
| Primary pill | bright lime `#9fe870`, hover `#80e142`, pressed `#65cf21`; text `#163300` | the same |
| Secondary pill and pale tint | pale lime `#e2f6d5`, hover `#d3f2c0`; text `#163300` | forest `#163300`; text `#9fe870` |
| Positive | `#054d28` on `#e2f6d5` | `#cef1b8` on `#054d28` |
| Negative | `#cb272f` on `#fbeaea` | `#ffa8ad` on `#410b0d` |
| Warning | `#4a3b1c` on `#fff7d7`; solid `#ffd11a` | `#fadc65` on `#3a3523` |
| Information | teal `#054d4d` on `#e0f7f7` | `#e0f7f7` on `#054d4d` |

- **Radius.**
  - 10px for inputs, selects, menu items and tooltips;
  - 16px for cards, alerts, popovers, menus, tables and snackbars;
  - 32px for dialogs, and 40px for big marketing panels;
  - 6–8px for badges;
  - every button, chip, nav item and segmented control is a pill, and every icon holder is a circle.
- **Shadow.** Almost none. Cards are fills, not floats.
  - Popovers, menus, tooltips and side panels take one soft halo, `0 0 40px rgb(69 71 69 / 0.2)`.
  - A marketing panel on a coloured band takes a long drop.
  - In dark mode, shadows become a 1px ring of white at 20%.
- **Motion.** 150ms `ease-in-out` for colour changes. 300ms for rings and segment moves. 350ms
  `cubic-bezier(0, 0.94, 0.62, 1)` for things that slide: the tab line and the switch knob.
- **Spacing.** A 4px unit. The usual gaps are:
  - 4px between a label and its control;
  - 8px between pills in a row;
  - 12px of padding above and below a list row;
  - 16px of padding in alerts and 24px in cards and dialogs;
  - 24px between fields;
  - 40px between page sections.
- **Layout.**
  - A 264px white side column, with no edge line.
  - Content to about 65rem (1040px) wide, with a gutter of `clamp(1rem, 4vw, 2.5rem)`.
  - Forms and sign-in in a 30rem (480px) column, settings in 45rem.
  - Grids gap 16px.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.85` on the page; controls and
  padding shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Text face.** Inter for everything in the product: 400 for text and 600 for anything that must be
  found (titles, labels, buttons, the title line of a row, links). Load it from
  `@fontsource-variable/inter`.
- **Display face.** Sofia Sans Condensed, at 900 for headlines and 800 for big money figures.
  - Headlines are capitals with a 0.85 line height, tracked −2%: "BUILT TO COST YOU LESS".
  - Figures keep their case with a line height of 1: `48,215.60 GBP`.
  - Use it only for marketing headlines, the total balance and transfer amounts; never for body or
    for in-app titles.
- **Mono.** IBM Plex Mono, small, only for account numbers and codes.
- **Sizes** (rem of 16px):
  - body 16px with a 1.5 line height;
  - secondary text, labels, row subtitles and table text 14px;
  - captions 12px;
  - row titles 16px at 600;
  - section titles 22px;
  - screen titles 30px at 600, tracked −2%;
  - display headlines 40px, 64px and up.
- **Case.** Sentence case everywhere in the product. Capitals only for display headlines.
- **Figures.** Amounts carry the currency code after the number, one size throughout: `1,240.00 GBP`.
  Use tabular figures in lists. Incoming money takes a plus and the positive green: `+ 860.00 EUR`.
  Outgoing money is plain text with no minus sign.

## Icons

- Lucide, outlined, **1.5px stroke**. Sizes:
  - 16px in buttons and beside text;
  - 24px in list rows, nav items and icon circles;
  - 48px in empty states, and 64px for full-page errors.
- Icons live in circles:
  - in the product, a 48px circle in the neutral fill with the icon in forest green;
  - on public pages, a 48px white circle with a hairline ring;
  - for empty states, a large pale-lime circle.
- Money direction is an arrow, not a colour: `arrow-up` for sent, `arrow-down` for received,
  `arrow-left-right` for converted, `credit-card` for card spend.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (horizontal, in a round icon button), close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `arrow-up`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-x`.

## Charts

- **One series:** a 2px forest-green line (bright lime in dark), with no fill and no gridlines. Labels
  are in muted 12px.
- **More series** step through forest green, bright lime, teal, bright orange, bright yellow and dark
  purple.
- Bars have rounded ends. Tooltips use the popover treatment.

## States (every control)

- **Hover.**
  - The lime pill goes from `#9fe870` to `#80e142`, and the pale-lime pill from `#e2f6d5` to
    `#d3f2c0`.
  - Quiet buttons, rows and nav items take the neutral fill.
  - Input rings darken from `#868685` to `#6c6c6b`.
  - Nothing lifts.
- **Focus.** A 2px forest-green ring 2px outside the control (bright lime in dark), on keyboard focus
  only. Never remove it.
- **Pressed.** One step deeper than hover (`#65cf21`, `#c5edab`, `#e1e5de`). Nothing moves.
- **Disabled.** 45% opacity, and the cursor shows not-allowed. Say why nearby rather than hiding the
  action.
- **Error.**
  - The control's ring turns red.
  - Under it, a small inline prompt: a 16px alert icon and the message in red, on the pale red
    surface with a 10px radius. It says how to fix it.
- **Loading.** A button keeps its width and its label; `aria-busy="true"` hides the label behind a
  spinner in the button's text colour. Lists show neutral-fill skeleton rows (a circle and two bars).
- **Selected and current.**
  - A nav item or menu item takes the neutral fill, with forest-green text at 600.
  - A segmented control shows a white pill on the neutral track.
  - A chip is filled forest green with lime text.
  - Checked controls are forest green.

## Components

All 36 of the library's components, as Fennel draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: about 65rem, or 45rem for settings and 30rem for forms;
- `m-split`, a 264px side column beside the main one;
- `m-grid`, for cards: 16px gaps, 12rem columns for balances and 22rem for list-and-panel;
- `m-stack` and `m-cluster`, for everything inside.

Sections are 40px apart.

**Actions and forms**
- **Button.** Always a pill, at 600. 32px (`sm`) in bars and rows, 40px by default, and 48px (`lg`)
  for the main action of a form, usually full width.
  - **Primary:** bright lime with forest-green text, one per view.
  - **Secondary** (the default): pale lime with forest-green text, and no border.
  - **Ghost:** forest-green text that takes the neutral fill on hover. For a tertiary action, underline
    the label.
  - **Danger:** solid red with white text, only to confirm something destructive.
  - **Icon-only:** a round pill with an `aria-label`. On white, give it the neutral fill.
- **Input, textarea.** 48px, 10px radius, transparent, with a 1px `#868685` ring that darkens on hover
  and becomes forest green on focus. Text 16px; the placeholder is in the subtle grey. A search field
  is a pill with the search icon inside on the left.
- **Select.** The same box as an input, with a chevron. Currency pickers are neutral-fill pills.
- **Field.** The label above (14px at 600, near-black), 4px gap, the control, then the help text (14px
  muted) or the error as an inline prompt. Fields stack 24px apart in one column.
- **Checkbox, radio.** The checkbox is 22px with 3px corners; the radio is 24px. Both have a grey ring
  at rest, and turn forest green when checked with a white mark.
- **Switch.** 50 × 28px: a grey track off, forest green on, with a white knob that slides with the
  emphasized easing. It takes effect at once, with no Save.

**Navigation**
- **Sidebar.** 264px, white, with no edge.
  - Top: the product name in the display face, in forest green.
  - Items are 16px with a 24px icon and a pill hover; the current one has the neutral fill and
    forest-green text at 600.
  - Group headings are muted 14px at 600, in sentence case.
  - A small neutral card can sit at the bottom (an offer, with a link).
- **Navbar** (public pages). 76px tall, with no border. It often sits on the bright lime band with
  forest-green text. Links are 18px at 600 with pill hovers; "Log in" is a link, and "Sign up" is a
  small forest pill on lime, or a lime pill on white.
- **Top bar** (in the app). No fill. On the right: a round neutral bell button, and the avatar with
  the person's name.
- **Tabs.**
  - **Underline:** muted labels, the current one in forest green at 600 on a 2px forest line over a
    hairline.
  - **Pill** (the segmented control): a neutral pill track with 4px of padding, and a white pill for
    the selected segment, with no shadow.
- **Breadcrumb.** Muted links with the current page in near-black. In flows, a back arrow button is
  preferred.
- **Pagination.** Round items in forest-green text, with the current one filled forest green with
  lime text. In lists, prefer "Load more" at the end.

**Data and content**
- **Table.**
  - A neutral frame: 8px of the fill around a white inside, 16px outer corners.
  - Headers are 14px at 600, muted, in sentence case. Cells are 14px, on hairline rows that take the
    neutral fill on hover.
  - Amounts are right-aligned with tabular figures. Prefer list rows for activity; use a table only
    for real columns (fees, statements).
- **Card.** The neutral fill, 16px radius, 24px padding, with no border and no shadow. A white card
  with a hairline border (the `outline` variant) sits on coloured or neutral backgrounds. A balance
  card shows a white circle with the currency symbol, then the amount at 18px/600 and the currency
  name muted.
- **Badge.** 8px radius, 14px at 600, tinted by tone: neutral (the fill and muted text), success
  ("Connected"), danger, and solid forest with lime text for "New".
- **Avatar.** Round. Initials in forest green at 600 on pale lime. Icon circles use the neutral fill.
  Sizes: 32px in bars, 40px for balances, 48px in rows, 72px for a profile.
- **Divider.** A hairline. Prefer space; in fee lists and side panels, hairlines between rows.
- **Accordion.** Rows separated by hairlines, the question at 18px/600, and the answer in muted text.
  No fills.
- **Code, kbd.** IBM Plex Mono on the neutral fill: blocks with a 10px radius, inline code and keys
  with 6px.
- **Prose.** 16px with a 1.5 line height, at most about 68 characters a line. Links are forest green
  at 600, underlined with a 3px offset.
- **Progress.** An 8px bar with 10px ends: forest green on the neutral track. In flows, step labels
  sit under a 4px bar, with the current one in forest green at 600.
- **Meter.** The same bar; it turns red past the "high" mark.
- **Usage.** A label and an amount over a meter bar, with the amount in tabular figures.

**Feedback and overlays**
- **Alert** (the prompt).
  - The tone's tinted surface, 16px radius, 16px padding, no border and no stripe.
  - A 24px status icon on the left. Text is 14px in the tone's colour, the title at 600, and links are
    underlined.
  - A danger prompt sits above the form it is about and says what was not done ("Nothing was sent").
- **Toast** (the snackbar).
  - A dark grey slab (`#454745`; light `#f1f1ed` in dark mode) with light text, 16px radius, 12px by
    16px padding, no shadow. Bottom centre on phones, bottom right on wide screens, at most 30rem.
  - One line and one underlined text action ("View", "Undo").
  - The tone shows only in the icon, never in the slab.
- **Dialog.**
  - White, 32px radius, no shadow, over a 40% near-black scrim, 24px padding.
  - The title is 22px at 600; actions are full-width pills stacked on phones, or on the right with the
    primary last.
  - A destructive confirm restates the effect and uses the danger pill.
- **Popover and menu.**
  - White, 16px radius, 8px inner padding, the soft halo, no border.
  - Items are 48px rows at 16px with 10px corners, taking the neutral fill on hover. A destructive item
    is in red at the bottom.
- **Tooltip.** A white panel with the soft halo, near-black 14px text, 10px radius and 12px by 16px
  padding. Never a dark chip.
- **Spinner.** A ring in forest green. Use it inside buttons and small areas only.
- **Skeleton.** Neutral-fill blocks: a circle and two bars for each row, with a slow shimmer that
  stops under reduced motion.

**AI and chat**
- **Chat.**
  - Assistant messages on white, with no bubble.
  - The person's own messages sit on the neutral fill with a 16px radius, right-aligned.
  - Timestamps are muted 12px.
- **Composer.**
  - A white box with a 16px radius and the grey control ring, which turns forest green while typing.
  - Send is a round lime pill with the `arrow-up` icon.
  - Attachments are small neutral pills.
- **Thinking.** A muted line ("Thinking…") with a soft pulse. **Tool call:** a hairline-bordered row
  with a 16px icon, the tool name and its status badge.
- **Citation.** A small neutral pill with a number, and the source on hover in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the ring turns red and an inline prompt appears under it, with the alert icon and
  how to fix it ("This IBAN is 3 characters short. French IBANs have 27."). Validate on blur and on
  submit, never while someone is still typing.
- **In a form:** a danger prompt above the form, saying how many things need checking and what was
  not done ("2 details need checking. Nothing was sent."). Focus moves to it; each field shows its own
  prompt.
- **Somewhere else:** a snackbar with what happened and one action ("Your transfer to Fenwick Glazes
  was returned · View").
- **A whole page:** left-aligned in the content column, with a large icon in a pale lime circle to the
  right.
  - A 30px title at 600, one short line in muted 14px, then a link or pills. The code sits small in
    mono above the title.
  - **404:** "Sorry, looks like we lost this page." with Go to Home and a Help Centre link.
  - **500:** "Something went wrong on our side." and "Nothing was sent or changed", with Try again and
    Contact us.
  - **403:** "You don't have access to this." with Ask for access.
- **Words.** Say what happened, whether money moved, and what to do. No codes in sentences, no blame,
  no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - "Total balance" in muted 14px over the total in the display face at 64px.
  - A row of pills: the lime "Send", then pale-lime Add money, Request and Convert, each with a 16px
    icon.
  - Balances as neutral cards in a grid, a success prompt with an offer, then "Transactions" with a
    "See all" link over circle-led rows.
- **List and detail.**
  - A screen title, with a small pale-lime "Statement" pill on the right.
  - A pill search field, then filter chips, then rows grouped under muted date headings.
  - A row opens a white side panel on the soft halo: a close button, the amount in the display face,
    Updates and Details tabs, a timeline of steps, label-and-value rows, and two pale-lime pills.
- **Onboarding.**
  - A flow bar with the product name and a close button over a hairline.
  - A 4px step bar with step labels, then a centred 30px title and one muted line with a link.
  - One 30rem column: fields, then choice rows (an icon circle, a title, a description and a radio)
    with a forest ring on the chosen one.
  - A full-width 48px lime Continue.
- **Settings.**
  - The profile: a 72px avatar, the name at 30px and the membership number muted, with an "Edit
    profile" pill.
  - Groups under muted 14px headings: rows with an icon circle, a title and a description, ending in a
    chevron or a switch.
  - Closing the account comes last, with the danger pill.
- **Empty state.** A 96px pale-lime circle with a 48px icon, a 22px heading, one sentence, a lime pill
  and a pale-lime one.
- **Pricing.**
  - A bright lime band holding the navbar and a display headline in capitals, in forest green.
  - A white 40px-radius panel of arrow rows on a long drop ("Send money", "Receive money"…).
  - Then "FEES AT A GLANCE": groups led by ringed icon circles, rows with the description muted and
    the price on the right ("Free" in green), separated by hairlines.
  - An accordion of questions.
- **Errors.** The field, form, snackbar and full-page errors above, as one page.

## Words

- Short, plain and direct, in sentence case, with "you" and "we": "Send", "Add money", "We paid out
  your EUR".
- Amounts with the currency code after them; dates short ("Today", "Yesterday", "Nov 9").
- Say what it costs before anything happens.

## Do and don't

| Do | Don't |
| --- | --- |
| Use bright lime only to fill the one primary pill, with forest-green text | Put white text on lime, lime text on white, or lime on large areas inside the product |
| Make every button, chip and nav item a pill | Square buttons, or outlined primary buttons |
| Use the neutral fill for cards and hovers | Draw card borders, or add shadows to things on the page |
| Lead list rows with a 48px icon circle | Bare text rows, or coloured icons without a circle |
| Keep in-app titles in the text face at 600 | Use the display face for body, labels or in-app titles |
| Write amounts as `1,240.00 GBP`, with incoming in green and a plus | Use red for money going out, or a minus sign |
| Put field errors in a tinted inline prompt under the field | Red text floating alone, or errors only in a toast |
| Use the same icon for the same action | Mix icon sets, fill icons, or change the stroke |
