# Ember

Category: calm fintech. Friendly and plain: white rounded cards on a pale mint screen, deep navy
text, heavy wide headings, one clear blue for every action, pill buttons with pale pill
secondaries, grouped list rows with line icons, and amounts with small pence. Navy is both the
slab colour in light mode and the whole screen in dark mode. For everyday money apps that should
feel friendly and on your side.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `ember` preset of `@mariachi/design` (`data-theme="ember"`,
`themes/ember.css`).

## Principles

- **Friendly, not fussy.** Plain words, generous rows, round corners. Headings are heavy (800) and
  wide; everything else is regular weight. Nothing is decorated for its own sake.
- **One blue for doing things.** Buttons, links, switches, checks, focus and the current tab are the
  action blue. Navy is for reading. Green means money in or something good. Red-coral means
  something went wrong.
- **Cards on mint.** The screen is pale mint; content sits on white cards with 16px corners and no
  border. Related rows share one card, separated by hairlines that start after the icon.
- **Money reads at a glance.** Balances are large with the pound sign and pence small. In lists the
  pound sign is dropped (`14.35`), money in is green with a plus (`+38.00`), and money out is plain
  navy with no minus.

## Foundations

**Brand colour** (`--m-color-brand-default`): the hot coral `#ff4f40` with navy text, for the account card, plan names on the pricing page and brand panels. It's not the action colour (blue), and white text never goes on it.

| What | Light | Dark |
| --- | --- | --- |
| Screen (canvas) | pale mint `#f2f8f3` | navy `#091723` |
| Cards (surface, raised) | white `#ffffff` | `#112231`, raised `#1a2c3d` |
| Quiet fill (grouped rows, hover, skeletons) | `#f4f5f5` | `#1a2c3d` |
| Slab (account cards, toasts, tooltips, not found) | navy `#091723` | blue-navy `#1d4466` |
| Text: default, muted, subtle | `#091723`, `#4d5870`, `#5f6b76` | `#ffffff`, `#c3c8cf`, `#a3adb8` |
| Hairlines | `#e1e3e7` | `#24384a` |
| Control borders | `#7e8898` | `#7a8a9b` |
| Action blue (fill) | `#007cb4`, hover `#006596`, pressed `#005680` | the same |
| Action blue (text: links, ghost buttons) | `#006596` | `#5db4e3` |
| Pale pill (secondary buttons) | `#e5eee8` with blue text | `#173247` with light blue text |
| Money in, success | green `#007a32` text, `#008838` fill | `#5ddc8a` text |
| Errors and destructive | coral-red: border `#ff4b44`, text `#c82f1f`, fill `#dd3524` | border `#ff6a5f`, text `#ff8a80` |
| Warning | amber `#f5a623` fill, `#7d4e00` text | `#f5c46a` text |

- **Radius.** 4px for tags and checkboxes, 6px for inputs and selects, 12px for icon tiles, menus
  and toasts, 16px for cards, dialogs and the table. Buttons, chips, badges, nav items and the
  segmented control are pills.
- **Shadow.** Cards on the mint screen have none. A card that lifts (a recommended plan, a hover)
  takes a soft green-tinted shadow. Dialogs and menus take a long, layered sheet shadow. In dark
  mode, a 1px light ring instead.
- **Motion.** 150, 200 and 400 ms, easing out. Switches and segments slide; nothing bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px inside a group of pills;
  - 12px between list rows (each row is about 64px tall with a 40px tile);
  - 16px between cards;
  - 20px card padding, 32px for a large card;
  - 24–64px between page sections.
- **Layout.**
  - A 240px white side column with a hairline edge.
  - Content to 72rem (1152px), with a gutter of `clamp(1rem, 4vw, 4rem)`.
  - Forms in a 27.5rem (440px) column, settings and single-purpose pages in 45rem.
  - Cards gap 16px.
- **Density.** 1 by default. For dense screens, set `--m-density: 0.8`: 48px controls become 38px.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Golos Text throughout: regular (400) for text, semibold (600) for labels that must be
  found and card titles, extra bold (800) for headings and big moments. Headings are wide and
  heavy; never use a light weight for them.
- **Mono.** DM Mono, only for references and codes.
- **Sizes** (the site's 1.25 scale):
  - body 16px with a 1.4 line height; help and secondary lines 14px;
  - card titles 16px at 600;
  - section and dialog headings 25px at 800;
  - page titles 31px at 800, tracked −1%;
  - marketing headings 39px and 49px at 800 with a 1.2 line height.
- **Case.** Sentence case everywhere. Only badges are capitals (12px, bold, tracked 2%).
- **Figures.** Use `font-variant-numeric: tabular-nums`. Balances are medium weight with the `£` and
  the pence at 70%, on the baseline: `£1,234.56`. List amounts drop the `£`; money in is green with
  a `+`.

## Icons

- Lucide, outlined, **2px stroke**, rounded ends: 20px beside text and in navigation, 18px inside
  buttons, 16px inside small buttons. Never filled.
- Row icons sit in a 40px tile with 12px corners on the tone's wash: the pale blue for most rows,
  green, amber, red or info for status. Big moments (empty states, errors) use a 64–96px circle.
- The top bar has round icon buttons on the pale pill (rewards, search) and one round blue `+`.
- Chevrons (`chevron-right`) end rows that open something; switches end rows that toggle.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (horizontal, in a round button), close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **Bars,** not lines: rounded 6px bars, the current period in the action blue and the rest in the
  hairline grey. Month labels underneath in 14px muted. No gridlines and no axis.
- **Categories** step through coral, blue, teal, amber, purple and green, shown as small dots
  beside the category name and its amount.
- **Budgets** are a meter: green while there's room, amber near the limit, red over it.

## States (every control)

- **Hover.** Fills step one shade darker: the blue from `#007cb4` to `#006596`, the pale pill from
  `#e5eee8` to `#d9e6dd`. Input borders darken to `#4d5870`. Rows take the quiet fill. Cards don't
  move.
- **Focus.** A 2px ring in `#247baf` outside the control, on keyboard focus only; inputs also turn
  their border blue. Never remove it.
- **Pressed.** One step darker than hover. Nothing moves.
- **Disabled.** Half opacity, no hover. Say why nearby when it matters.
- **Error.**
  - The control's border turns coral-red.
  - The message replaces the help text under the field, in red 14px, and says how to fix it.
- **Loading.**
  - A button keeps its width and its label; `aria-busy="true"` swaps the label for a small spinner
    and blocks clicks.
  - Lists and cards show grey skeleton blocks at row height, never a whole-page spinner.
- **Selected and current.** Blue: the current nav item is blue text on a pale blue pill; the current
  tab is blue with a 2px blue line; checked controls and switches fill blue; the segmented control
  shows a white knob on a grey track.

## Components

All 36 of the library's components, as Ember draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 72rem, or 45rem for settings and 27.5rem for forms;
- `m-split`, the 240px side column beside the main one;
- `m-grid`, for cards: 16px gaps; 11rem columns for spotlight tiles, 22–24rem for main cards;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** Always a pill, 16px at 600, 48px by default and 38px (`sm`) inside cards and bars.
  - **Primary:** the solid action blue with white text; one per view.
  - **Secondary** (the default): the pale pill with blue text and no border ("See plans", "Top up",
    "Share the cost").
  - **Ghost:** blue text only ("View everything", "Cancel").
  - **Danger:** solid red, only to confirm something destructive.
  - **Icon-only:** a round pill with an `aria-label`; the top bar's `+` is primary.
  - On the public site, the main call to action is a navy pill ("Sign up"): set
    `--m-button-primary-bg` to `var(--m-color-bg-inverse)` on it.
- **Input, textarea.** 48px, 6px corners, white, a grey border that darkens on hover and turns blue on
  focus, 16px text. Big amounts may use 25px text.
- **Select.** The same box with a chevron.
- **Field.** The label above in 16px regular navy, 8px gap, the control, then the help text (14px
  muted) or the error (14px red) below. Short pairs (first and last name, sort code and account
  number) sit side by side; split dates into day, month and year boxes.
- **Checkbox, radio.** 24px. The checkbox has 4px corners; both fill blue when checked. In settings, a
  radio sits at the end of its row.
- **Switch.** 51 × 31px: grey when off, blue when on, a white knob with a soft shadow. It takes effect at
  once: no Save.

**Navigation**
- **Sidebar.** 240px, white, with a hairline edge.
  - Top: the wordmark, then the avatar and a "See plans" pale pill.
  - Items are 16px with a 20px icon, grey, as pills; the current one is blue on a pale blue pill.
  - A second group (Settings, Help) sits apart. Counts are small pale blue pills.
- **Navbar** (public pages). White, 84px, with the heavy wordmark, then 16px pill links in muted navy
  (the current one on mint), and "Log in" (pale pill) and "Sign up" (navy pill) at the right.
- **Top bar** (in the app). No fill. Round pale icon buttons and the round blue `+` at the right.
- **Tabs.**
  - **Underline:** 16px bold, grey; the current one blue with a 2px blue line over a hairline.
  - **Pill** (the segmented control): a grey pill track with a white knob, for filters like All, Money
    in, Money out.
- **Breadcrumb.** Blue links separated by `›`, the current page in navy. In the app, prefer a back
  arrow.
- **Pagination.** Grey numbers; the current one a navy square with 6px corners and white text. In
  lists, prefer a "View everything" link and loading more on scroll.

**Data and content**
- **Table.**
  - In a white card with 16px corners and no outer border.
  - Headers 16px bold navy in sentence case, over a hairline.
  - Rows are separated by hairlines and darken on hover (`#ededed`). Long data tables add
    `data-striped` for the reference's `#f7f7f7` stripes. The last column is right-aligned.
  - Plan comparisons put a pill button and the price in each column header, a bold group row per
    section, a green `circle-check` for yes and a grey `circle-x` for no.
- **Card.** White, 16px corners, no border and no shadow on the mint screen, 20px padding. Titles are
  16px at 600, not headings. The account card is a navy slab with the balance large and white.
- **Badge.** A pill, 12px bold capitals: green for good news ("PAID"), blue-washed for information
  ("MOST POPULAR"), red for problems, mint for neutral.
- **Avatar.** Round, initials at 600 on a pastel (teal by default). Merchants use the same size with
  12px corners and a pastel per tone. 24px small, 40px in rows, 64px in headers.
- **Divider.** A hairline. In cards, rows are separated by hairlines that start after the icon.
- **Accordion.** Separate white rows with 8px corners and a hairline border, the question at 16px
  semibold, the answer in muted text, a chevron that turns.
- **Code, kbd.** DM Mono on the mint fill, with 4px corners for inline code and keys.
- **Prose.** 16px with a 1.4 line height, at most 40rem wide, links in blue and underlined.
- **Progress.** A 6px pill bar: blue on the hairline grey. Savings goals show one under the name.
- **Meter.** The same bar: green with room left, amber when low, red when over.
- **Usage.** A label and amount over a meter bar, with the amount in tabular figures.

**Feedback and overlays**
- **Alert** (a notice).
  - A pale wash of the tone with a 1px border of the tone and 6px corners, no side stripe.
  - A 20px status icon, a semibold title and the body in 16px.
  - Error notices sit above the form and say what didn't happen ("We haven't sent anything").
- **Toast.**
  - A navy banner with 12px corners, a white title, light grey detail and one pale pill action.
  - It's navy whatever the tone; the words carry the tone.
- **Dialog.**
  - White, 16px corners, the sheet shadow over a 50% navy scrim, 24px padding.
  - The title is 25px at 800.
  - Actions are pills at the bottom right: the primary last, Cancel as ghost.
- **Popover and menu.**
  - White, 12px corners, the sheet shadow, 8px inner padding.
  - Items are 44px rows at 16px with 8px corners, highlighting in the quiet fill; a destructive item
    is red.
- **Tooltip.** A navy chip with white 14px text and 5px corners, no arrow.
- **Spinner.** A blue ring turning every 0.8s, inside buttons and small areas only.
- **Skeleton.** Grey `#e1e3e7` blocks at row and figure sizes, pulsing gently; still under reduced
  motion.

**AI and chat**
- **Chat** (support chat).
  - The other side's messages on white cards with 16px corners.
  - The person's own messages in the action blue with white text, on the right.
  - Times are 12px muted.
- **Composer.** A white box with 24px corners and a grey control border that turns blue while typing.
  Send is the round blue `+`-style pill with the `send` icon.
- **Thinking.** A muted line ("Thinking…") with a soft pulse. **Tool call:** a row in a 12px-cornered
  box with a 16px icon, the name, and a pill status badge.
- **Citation.** A small pale blue pill with a number, and the source in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the help text: what's wrong and the
  fix, with an example ("A sort code is six numbers, for example 60-14-22"). Check on blur and on submit,
  never while someone types.
- **In a form:** a red notice above the form: "Check the details below", then how many things and
  what didn't happen ("We haven't sent anything"). Focus moves to it.
- **Somewhere else:** a navy toast that says what happened and what it means for their money ("Nothing
  left your account"), with one action ("Try again").
- **A whole page:**
  - **Not found** is a navy slab: a huge white "404", a short heavy white line ("This page has wandered
    off"), and one pale pill home.
  - **Failure (500)** and **no access (403)** are white cards: a 36px icon in an 80px pale circle,
    the code in small mono, a 25px heavy title, one sentence and one or two pills.
- **Words.** Say sorry when it's our fault, say whether money moved, and say what to do next. No
  codes in sentences, no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - A heavy greeting ("Morning, Priya").
  - Four spotlight tiles: a figure, a label, and a detail or a meter.
  - The account as a navy card (balance large, sort code and account number, pale pills for "Top
    up" and "Card settings", a round `…`), a card of the latest payments with a "View everything"
    link, then spending bars with categories and the savings goals.
- **List and detail.**
  - The title, a search box, and a segmented filter.
  - Transactions grouped by day ("Today", "Yesterday") with the day's total, each day a white card.
  - The open transaction beside it: a centred header (merchant tile, name, time, amount large), pale
    pill actions (Share the cost, Attach receipt, Write a note), then grouped rows and a details list.
- **Onboarding.** One white card on mint at 440px: a thin progress bar, a heavy centred title, one
  question per field, a full-width blue pill, and a line with a bold "Log in" link.
- **Settings.** The profile card, then grouped cards (Account, Privacy and security, Notifications,
  Theme) of icon-tile rows with chevrons, switches or radios. Closing the account comes last.
- **Empty state.** A white card: a 44px icon in a 96px pale blue circle, a heavy title, one friendly
  sentence, a blue pill and a pale pill.
- **Pricing.**
  - The white public bar, a 49px heavy headline and a 20px intro.
  - Three plan cards (the recommended one lifted with a badge), each with ticks and a blue pill.
  - A heavy heading over the comparison table, then questions in an accordion and a navy footer with
    rounded top corners.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Friendly and direct, in sentence case, in the second person: "Top up", "Share the cost",
  "View everything", "Report a problem with this payment".
- Short dates ("Today", "Yesterday", "Thursday"), money exact.

## Do and don't

| Do | Don't |
| --- | --- |
| Put white cards on the mint screen | Put cards on white, or give them borders |
| Make headings heavy (800) and body regular | Use light or thin weights |
| Use the blue for every action and the current item | Use navy or coral for buttons inside the app |
| Make every button and chip a pill | Square buttons, or outlined secondaries |
| Group rows in one card, hairlines starting after the icon | One card per row, or full-width zebra lists |
| Show money in green with a plus; money out plain | Use red for money going out |
| Set the pound sign and pence small | Show balances at one flat size |
| Use the same icon for the same action | Mix icon sets, fill icons, or colour them for decoration |
