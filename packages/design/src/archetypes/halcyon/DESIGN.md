# Halcyon

Category: calm fintech. Airy and exact: ink-violet text on white, one blue-violet accent, light type
weights, pill-shaped actions, cards that float on a ring shadow, full-bleed hairline tables, and
figures with small raised cents. For money and finance tools that should feel quiet and modern.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `halcyon` preset of `@mariachi/design` (`data-theme="halcyon"`,
`themes/halcyon.css`).

## Principles

- **Light, not loud.** Type is light: 360 for body, 380 for headings. Colour is rare and space does
  the work. Nothing is bold except what must be found at a glance.
- **One accent, used for the one action.** The blue-violet fills the primary pill and draws the
  chart line. Everything else is ink, grey and white.
- **Exact figures.** Amounts use tabular figures with the cents small and raised. Incoming money is
  green; outgoing money is ink with a minus sign, not red.
- **Quiet structure.** Cards float on a soft ring shadow with no drawn border. Tables and settings are
  separated by hairlines, not boxes.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | white `#ffffff`; the sidebar and quiet panels `#fbfcfd` | `#171721`, cards `#1e1e2a`, raised `#272735` |
| Text: default, muted, subtle | `#1e1e2a`, `#535461`, `#70707d` | `#ededf3`, `#c3c3cc`, `#9d9da8` |
| Hairlines | `#e8e9ef` (the neutral at 16%); lighter `#f1f1f4` | `#3b3c4b`; `#2c2c3a` |
| Accent | `#5266eb`; links and accent text `#465bd1` | `#5266eb`; text `#a7b6f8` |
| Gained | green `#036e43` | `#7fd3ab` |
| Lost or failed | deep magenta `#b0175f`, never red | `#f39cc3` |
| Neutral fill: secondary pills, hover, current nav | `#f1f1f4` | `#2c2c3a` |

- **Radius.** 4px for badges and small parts, 8px for inputs, selects and nav items, 12px for cards
  and dialogs. Every button is a pill.
- **Shadow.** A ring: a `0 0 2px` neutral halo plus a `0 1px 4px` soft drop. Popovers and dialogs add
  a long faint drop. In dark mode, a 1px ring instead.
- **Motion.** 150, 300 and 500 ms with `cubic-bezier(0, 0, 0.6, 1)`: things decelerate, never bounce.
- **Spacing.** A 4px unit. The usual gaps are:
  - 8px inside a control group;
  - 12–16px between fields;
  - 24px between cards and in card padding;
  - 32–40px between page sections.
- **Layout.**
  - A 220px sidebar with a hairline edge.
  - Content to about 61rem (976px) wide, with a gutter of `clamp(1rem, 4vw, 2rem)`.
  - Forms and articles in a 30rem (480px) column, settings in 48rem.
  - Grids gap 24px.
  - Tables run full width of the content column.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.85` on the page; controls and
  padding shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.** Inter (variable) for text, at weight 360 for body and 420 for emphasis. Inter Display
  for headings and large figures, at 380. The light weights are the look: load the variable font
  (`@fontsource-variable/inter`) so 360 and 380 render as set.
- **Mono.** Roboto Mono for account numbers and codes, small.
- **Sizes:**
  - body text 15px with a 1.6 line height;
  - secondary text and table headers 13px;
  - labels 12px;
  - page titles 28px display at 380;
  - marketing headings 42px and 57px, tight leading, never bold.
- **Case.** Uppercase only for tiny section labels ("COMPARE PLANS"), tracked 6%.
- **Figures.** Use `font-variant-numeric: tabular-nums`, with the cents at about 62% size, raised half
  an em: `$5,216,471.18`. Outgoing amounts take a real minus sign: `−$750.00`.

## Icons

- Lucide, outlined, **1.25px stroke**: 14px in navigation, buttons and inputs; 16px beside text; 20px
  in empty states and headers; 40px for full-page errors. Never filled, never coloured except status
  icons.
- Every sidebar item and most action pills carry an icon before the label.
- Up and down are small diagonal arrows beside the amount (↗ green, ↘ magenta), never colour alone.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis-vertical` (vertical, in a round icon button), close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** a 1.5px accent line over a soft vertical fade of the accent (16% to 0%). No
  gridlines; date labels underneath in muted 13px.
- **More series** step through blue-violet, periwinkle, teal, green and magenta.
- Tooltips use the popover treatment.

## States (every control)

- **Hover.** Fills deepen one step: a secondary pill goes from `#f1f1f4` to `#e8e9ef`, and the primary
  from `#5266eb` to `#465bd1`. Rows and nav items take the sidebar tint or the neutral fill. There's
  no lift and no shadow change on buttons.
- **Focus.** A 2px accent ring outside the control (`--m-color-border-focus`), on keyboard focus only.
  Never remove it.
- **Pressed.** One step darker than hover. Nothing moves.
- **Disabled.** Half opacity; the cursor stays default. Never hide a disabled action that someone
  needs to know exists; say why nearby.
- **Error.**
  - The control's border turns magenta.
  - The message replaces the help text under the field, in magenta 13px, and says how to fix it.
- **Loading.**
  - A button keeps its width and its label ("Saving"); `aria-busy="true"` hides the label behind a
    small spinner and blocks hover and clicks.
  - Lists and cards show skeleton blocks in the neutral fill, never a spinner over the whole page.
- **Selected and current.** The neutral fill and an 8px radius (nav, segmented control); a white
  segment on the neutral track; checked controls in the accent.

## Components

All 36 of the library's components, as Halcyon draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: about 61rem, or 48rem for settings and 30rem for forms;
- `m-split`, a 220px side column beside the main one;
- `m-grid`, for cards: 24px gaps, 24rem columns for the large ones and 16rem for small summaries;
- `m-stack` and `m-cluster`, for everything inside.

Sections are 32–40px apart.

**Actions and forms**
- **Button.** Always a pill, weight 360, 32px (`sm`) in bars and rows, 36px by default.
  - **Primary:** solid accent, white text, one per view.
  - **Secondary** (the default): the neutral fill, ink text, no border.
  - **Ghost:** text only, for quiet actions in bars ("Move money", "Customize").
  - **Danger:** solid magenta, only to confirm something destructive.
  - **Icon-only:** a round pill with an `aria-label`.
- **Input, textarea.** 36px, 8px radius, white, a hairline border that darkens on hover. Focus ring
  in the accent; the placeholder is in muted text. Amounts are right-aligned with tabular figures.
- **Select.** The same box as an input, with a small chevron. Filter selects above a table are `sm`,
  in a row.
- **Field.** The label above (13px, regular), the control, then the help text or the error below. The
  required mark is a magenta asterisk. Fields stack 16px apart in one column, never side by side
  except short pairs (city, postcode).
- **Checkbox, radio.** 16px, 4px radius on the checkbox, the accent when checked, with a hairline
  border at rest.
- **Switch.** An accent track when on, a neutral one when off, a white knob. It takes effect at once:
  no Save.

**Navigation**
- **Sidebar.** 220px on `#fbfcfd` with a hairline edge.
  - Top: the workspace switcher, then a segmented product switch.
  - Groups separated by hairlines. Items are 15px with a 14px icon, and the current one has the
    neutral fill and an 8px radius.
  - Counts sit right-aligned and muted; "New" is a badge.
  - In settings: plain group headings in muted 12px.
- **Navbar** (public pages). White, no fill change on scroll, the links in ink at 15px, with a primary
  pill ("Open account") and a ghost one ("Log in") at the right.
- **Top bar** (in the app). No fill. A ghost "Search for anything" on the left; ghost actions, icon
  buttons and the avatar on the right.
- **Tabs.**
  - **Underline:** a 2px accent line under the current tab, in ink.
  - **Pill** (the segmented control): a neutral track, with the selected segment white with a ring
    shadow.
- **Breadcrumb.** Muted links with "/" between, and the current page in ink. In the app, a back link
  ("‹ Transactions") is preferred over breadcrumbs.
- **Pagination.** Ghost round buttons for pages, with the current one on the neutral fill and
  "Previous" and "Next" as ghost text buttons. In tables, prefer "Load more" or infinite scroll with
  the count shown.

**Data and content**
- **Table.**
  - Full-bleed: no outer frame and no header fill.
  - Headers are 13px muted, in sentence case.
  - Rows are separated by hairlines and highlight in the sidebar tint on hover.
  - Each party gets an initials avatar.
  - Amounts are right-aligned, and green when money comes in. A failed one is struck through, with an
    outlined magenta "Failed" badge.
  - A checkbox column is on the left when rows can be selected.
- **Card.** White, 12px radius, no border, the ring shadow, 24px padding. Card titles are 15px at body
  weight, not headings, and a card's main figure is 28px display. A clickable card deepens its shadow
  on hover.
- **Badge.** 4px radius, 12px, weight 360:
  - neutral grey ("Default");
  - outlined magenta ("Failed");
  - green tint ("Completed");
  - solid ink ("Pro").
- **Avatar.** Round, on a pale accent tint, with initials in accent text; square with an 8px radius
  for a company. 24px in rows, 32px in bars, 40px in headers.
- **Divider.** A hairline. In settings and details, rows are separated by hairlines rather than gaps.
- **Accordion.** Hairline-separated rows, the question at 15px, and a chevron on the right that turns.
  No fills.
- **Code, kbd.** Roboto Mono at 13px on the neutral fill with a 4px radius. Keys are small pills with
  a hairline border.
- **Prose.** Body text at 15px with a 1.6 line height, at most about 68 characters a line, links in
  accent text.
- **Progress.** A 6px rounded bar: the accent on the neutral track; indeterminate slides.
- **Meter.** The same bar; it turns magenta past the "high" mark.
- **Usage.** A label and amount over a meter bar, with the amount in tabular figures.

**Feedback and overlays**
- **Alert.**
  - A tinted background in the tone's pale colour, with no border.
  - A 16px status icon on the left; the title and the body in the tone's text colour, at body weight.
  - Danger alerts sit above the form they're about and say what was not done ("Nothing was sent").
- **Toast.**
  - Bottom right, white, on the overlay shadow, 12px radius.
  - The title at body weight, one line of detail, and one action ("View", "Undo", "Retry").
  - Success toasts close themselves after 5s; error toasts stay until dismissed.
- **Dialog.**
  - White, 12px radius, the overlay shadow over a 40% ink scrim, at most 30rem wide for a confirm.
  - The title is 19px.
  - Actions are on the right: primary last, Cancel as ghost.
  - A destructive confirm restates the effect in figures and uses the danger pill.
- **Popover and menu.**
  - White, 8px radius, the overlay shadow, 4px inner padding.
  - Items are 15px rows with a 14px icon, and highlight in the neutral fill.
  - Hairlines between groups; a destructive item in magenta at the bottom.
- **Tooltip.** Ink background (`#272735`) with white 13px text, a 4px radius, and no arrow. It appears
  after 300ms.
- **Spinner.** A thin ring in the accent. Use it inside buttons and small areas only.
- **Skeleton.** Neutral-fill blocks at text and figure sizes, with a slow, soft shimmer that stops
  under reduced motion.

**AI and chat**
- **Chat.**
  - Messages on white, with no bubbles for the assistant.
  - The person's own messages sit on the neutral fill with a 12px radius, right-aligned.
  - Timestamps are muted 12px.
- **Composer.**
  - A white box with a 12px radius, the ring shadow, and a control-strength border (the library's
    3:1 floor for controls), which turns accent while typing.
  - Send is a round primary pill with the `send` icon.
  - Attachments are small neutral pills.
- **Thinking.** A muted line ("Thinking…") with a soft pulse. **Tool call:** a hairline-bordered row
  with a 14px icon, the tool name and its status badge.
- **Citation.** A small neutral pill with a number, and the source on hover in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the control turns magenta and the message replaces the help text. Validate on blur
  and on submit, never while someone is still typing.
- **In a form:** a danger alert above the form, listing how many things need fixing and saying what
  was not done ("2 things need fixing. Nothing was sent."). Focus moves to it; each field shows its
  own message.
- **Somewhere else:** a toast with what happened and one action ("Payment to Bluebird Studio failed ·
  View").
- **A whole page:** centred in the content column.
  - A 40px outline icon in the subtle colour, the code in small mono, a 28px display title, one
    sentence and one or two pills.
  - **404:** "This page doesn't exist" with Go home.
  - **500:** "Something went wrong on our side" and "Nothing was changed", with Try again and Contact
    support.
  - **403:** "You don't have access to this" with Request access.
- **Words.** Say what happened, whether anything changed, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard.**
  - "Welcome, Dana" at 28px.
  - A row of small pills: the primary "Send", and secondary Transfer, Deposit, Request and Upload
    bill. "Customize" as a ghost on the right.
  - The balance with its area chart beside the accounts list, then smaller summary cards.
- **List and detail.**
  - The title, with a secondary pill on the right.
  - Filter selects in a row, then the month's figures above a full-bleed table.
  - A row opens its own page: a back link, the party's avatar and the amount large, then
    label-and-value rows.
- **Onboarding.** One 480px column, a thin progress bar and a light 42px heading. Fields one under
  another, Back as a ghost button and Continue as the primary pill.
- **Settings.** A grouped settings nav beside label-and-value rows with "Edit ›" links. Closing the
  account comes last, with a danger pill.
- **Empty state.** A 40px thin outline icon, a light 19px heading, one sentence, a primary pill and
  a secondary one.
- **Pricing.**
  - One card split into three columns by hairlines, with a yearly switch above.
  - Tier names whose last word is in the accent, light display prices and full-width pills.
  - A tinted footer band, and an FAQ below.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Short and plain, sentence case everywhere: "Move money", "Match receipts", "Search for anything".
- Figures exact; dates short ("Nov 11").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep type light: 360 body, 380 headings | Use bold for headings or numbers |
| Make every button a pill | Square buttons, or outlined primary buttons |
| Float cards on the ring shadow | Draw card borders, or use heavy shadows |
| Separate rows with hairlines | Zebra stripes, filled table headers, boxed settings |
| Show gains in green, losses with a minus and ink | Use red for money going out |
| Set cents small and raised | Show amounts at one flat size in summaries |
| Use the same icon for the same action | Mix icon sets, fill icons, or colour them for decoration |
