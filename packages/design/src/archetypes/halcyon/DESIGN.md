# Halcyon

Category: calm fintech. Airy and exact: ink-violet text on white, one blue-violet accent, light type
weights, pill-shaped actions, cards that float on a ring shadow, full-bleed hairline tables, and
figures with small raised cents. For money and finance tools that should feel quiet and modern.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the nine page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `halcyon` preset of `@mariachi/design` (`data-theme="halcyon"`,
`themes/halcyon.css`).

## Principles

- **Light titles, plain text.** Four weights, each with one job: 380 for titles and large figures,
  400 for running text, 360 for actions and the top bar, 480 only for small labels. Colour is rare
  and space does the work. Nothing is bold except what must be found at a glance.
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

- **Families.** Inter (variable) for text, Inter Display for titles and large figures. The odd weights
  are the look: load the variable font (`@fontsource-variable/inter`) so 360, 380 and 480 render as
  set.
- **Weights: four on a screen, each with one job.**
  - **400** for running text: rows, nav items, values, descriptions (the body weight).
  - **380** for page titles and large figures (the heading weight): "Good morning, Dana", the balance.
  - **360** for every button and the top bar ("Search payments and people", "Pay or transfer"), and on public
    pages for prices and the lede.
  - **480** for small labels only: sidebar group labels ("Bookmarks"), counts, the plan badge, and on
    public pages the headlines and plan names. Public nav links are 16px at 420.
- **Mono.** Roboto Mono for account numbers and codes, small.
- **Sizes:**
  - body text 15px with a 1.6 line height in the app, 16px on public pages;
  - secondary text, field labels and table headers 13px;
  - small labels 12px at 480;
  - page titles 28px display at 380; a card's or an empty state's line 15–19px at 400;
  - public headlines 42px and 57px at 480 with tight leading; public section titles 28px at 480.
- **Case.** Uppercase only for tiny section labels ("COMPARE PLANS"), tracked 6%.
- **Figures.** Use `font-variant-numeric: tabular-nums`, with the cents at about 62% size, raised half
  an em: `$5,216,471.18`. Outgoing amounts take a real minus sign: `−$750.00`.

## Icons

- Lucide, outlined, **1.25px stroke**: **12px** in navigation, buttons, inputs and the top bar (the
  measured median on every recipe); 16px beside running text and in alerts. Empty states and whole-page
  errors carry no icon. Never filled, never coloured except status icons.
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
  - **Ghost:** text only, for quiet actions in bars ("Pay or transfer", "Customize").
  - **Danger:** solid magenta, only to confirm something destructive.
  - **Icon-only:** a round pill with an `aria-label`.
- **Input, textarea.** 36px, 8px radius, white, a hairline border that darkens on hover. Focus ring
  in the accent; the placeholder is in muted text. Amounts are right-aligned with tabular figures.
- **Select.** The same box as an input, with a small chevron. Filter selects above a table are `sm`,
  in a row.
- **Field.** The label above (13px at 400), the control, then the help text or the error below. The
  required mark is a magenta asterisk. Fields stack 16px apart in one column, never side by side
  except short pairs (city, postcode).
- **Checkbox, radio.** 16px, 4px radius on the checkbox, the accent when checked, with a hairline
  border at rest.
- **Switch.** An accent track when on, a neutral one when off, a white knob. It takes effect at once:
  no Save.

**Navigation**
- **Sidebar.** 220px on `#fbfcfd` with a hairline edge.
  - Top: the workspace switcher with the plan badge, then a segmented product switch.
  - Three groups separated by hairlines: the daily three (Home, Tasks, Assistant), the seven money
    areas, then Bookmarks under a 12px/480 label. Items are 15px at 400 with a 12px icon, 30px tall
    on a 36px pitch; the current one has the neutral fill and an 8px radius, and its sub-pages open
    beneath it on a guide line.
  - Counts sit right-aligned at 12px/480; "New" is a badge.
  - In settings: the same workspace header, a back link, then grouped pages under 12px/480 labels.
- **Navbar** (public pages). White, no fill change on scroll: the mark and wordmark at the left, the
  links centred in ink at 16px/420 with 12px chevrons on the menus, a ghost "Log in" and the primary
  pill ("Open an account") at the right. A journal page adds a second bar of sections under a hairline.
- **Top bar** (in the app). No fill. A ghost "Search payments and people" on the left; ghost actions, icon
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
- **Badge.** 4px radius, 12px, weight 360 (the plan badge beside the workspace at 480):
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
- **Prose.** Body text at 15px (16px on public pages) with a 1.6 line height, at most about 68 characters a line, links in
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
  - Items are 15px rows with a 12px icon, and highlight in the neutral fill.
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
  with a 12px icon, the tool name and its status badge.
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
- **A whole page:** the app frame stays (sidebar and top bar); the state sits centred in the content.
  - A 19px line at 400, one muted sentence, a muted 13px note of where you are ("Error 404 · signed in
    to Fieldstone"), and at most one secondary pill. No icon, no picture, no large title.
  - **404:** "This page doesn't exist" with Go home.
  - **500:** "Something went wrong on our side" and "Nothing was changed", with Try again.
  - **403:** "You don't have access to this" with Request access.
- **Words.** Say what happened, whether anything changed, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

### The three families

| | The app | Flows (onboarding, sign-in) | Public pages (pricing, reading) |
| --- | --- | --- | --- |
| Frame | The 220px pale sidebar with a hairline edge, then a bare top bar ("Search payments and people" left; "Pay or transfer", icon buttons and the avatar right). Every app page sits in it, empty, not-found and failed states included | A pale ground (the neutral fill), the mark and wordmark top left, one way out top right as a 16px ghost link | A white site bar: mark and wordmark, links centred at 16px/420, "Log in" ghost and the primary pill. A journal page adds a section bar under a hairline. A footer of 13px link columns under 12px/480 labels, then the fine print |
| Column | Content to about 61rem beside the sidebar; tables run the column's full width; a form 30rem | One white card in a 30rem column, 12px corners, the ring shadow | Pricing to 61rem; an article 40rem, centred |
| Titles | 28px display at 380, one per page; card and empty-state lines 15–19px at 400 | 28px at 380 for a step; 19px at 400 for "Log in" | 57px and 42px at 480, section titles 28px at 480, a light 19px lede at 360 |
| Running text | 15px at 400; labels 13px | 15px at 400; labels 13px | 16px at 400 |
| Primary | A solid accent pill, only where money moves or a form is finished ("Send", "Review payment"); a list page's own action is a quiet neutral pill | A solid accent pill at the end of the card | A solid accent pill in the site bar and the recommended plan; the quiet pills are tinted with the accent, not grey |
| Footer | None | None | The site footer |
| On a phone | The page comes first and the sidebar drops below it; the top bar wraps; tables scroll inside their column | The card fills the width with a 16px gutter | The site bar keeps the mark and the two pills; plan columns stack |

### Signature moves

1. **Four weights, each with one job:** 380 titles and figures, 400 text, 360 actions, 480 small labels.
   No screen uses a bold title.
2. **One frame for the whole app:** the pale sidebar of three hairline groups and the bare top bar stay
   on every app page, including empty and error states.
3. **Pills everywhere, the accent rarely:** every button is a pill at 360; the solid accent only where
   money moves or a flow ends; list pages act through a neutral pill.
4. **Small thin icons:** 12px at a 1.25px stroke in nav, buttons and the top bar.
5. **Figures with small raised cents,** gains in green, losses in ink with a minus.
6. **Rows on hairlines, cards on a ring:** tables, details and settings split by hairlines with no
   frame; only summaries float as cards on the ring shadow.
7. **Quiet states:** nothing-here and whole-page errors are a centred 19px line in body type, a sentence
   and at most one quiet pill; no icon, no picture.

### How a screen is assembled

- **It opens with** the frame (sidebar and top bar), then the 28px title on the left with the page's own
  action as a pill on the right. Public pages open with the site bar and a centred headline; flows with
  the mark and one card.
- **Reading order:** the title, then the controls that shape what follows (filter pills, the period),
  then the figures that sum it up, then the table or the cards.
- **How much one screen does:** one area of money. The dashboard is the exception: a row of action pills,
  the balance and accounts, then small summaries.
- **When narrow:** the page comes first and the sidebar drops below it; action pills wrap; cards go to
  one column; tables keep their columns and scroll inside the content.
- **Too much content:** tables load more rows below with the count shown; settings add more groups to
  the settings sidebar, never tabs.
- **None:** the title, the action, the filters and the column heads stay; one centred line says nothing
  is here and how to add one.

### The recipes

- **Dashboard.**
  - "Good morning, Dana" at 28px/380.
  - A row of small pills: the primary "Send", and secondary Transfer, Deposit, Request and Upload
    bill. "Customize" as a ghost on the right.
  - The balance (28px/380 with raised cents) with its area chart beside the accounts list, then
    smaller summary cards titled at 15px/400.
- **List and detail.**
  - The title, with a secondary pill on the right ("Attach receipts").
  - Filter selects in a row, then the month's figures (19px) above a full-bleed table of 53px rows.
  - A row opens its own page: a back link, the party's avatar and the amount large, then hairline
    label-and-value rows.
- **Onboarding.** The flow ground and one white card: "Step 2 of 4" at 12px/480 over a thin progress
  bar, a 28px/380 title and one muted line, fields one under another, Back as a ghost and Continue as
  the primary pill.
- **Settings.** The app frame with the settings sidebar (workspace, back link, four groups); a square
  company avatar and 28px title, label-and-value rows on hairlines with "Edit ›" links; closing the
  account comes last, with a danger pill.
- **Empty state.** The Recipients page with nothing in it: title and a secondary "Add recipient", the
  search and filters, the column heads, then a centred 19px/400 line, one sentence and a link.
- **Pricing.**
  - The site bar, a 57px/480 headline and a light 19px lede.
  - One card split into three columns by hairlines, with a yearly switch above: plan names at
    28px/480 whose last word is in the accent, prices at 28px/360, full-width pills (the recommended
    one solid, the others tinted), then the features.
  - A tinted footer band, questions, and the site footer.
- **Errors.** In the app frame: the form with its summary and field errors, a toast, then not found,
  failure and no access as centred lines.
- **Reading.** The site bar and the journal bar; a centred eyebrow, a 42px/480 headline, a light 19px
  lede and a byline; one 40rem column of 16px text with 28px/480 section titles; the site footer.
- **Sign-in.** The flow ground, the mark and "Open an account ›"; one white card with "Log in" at
  19px/400, email and password, the primary pill, then under a hairline a passkey pill and one muted
  line.

## Words

- Short and plain, sentence case everywhere: "Pay or transfer", "Attach receipts", "Search payments and people".
- Figures exact; dates short ("Nov 11").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep four weights: 400 text, 380 titles, 360 actions, 480 small labels | Use bold for app titles or numbers |
| Make every button a pill | Square buttons, or outlined primary buttons |
| Float cards on the ring shadow | Draw card borders, or use heavy shadows |
| Separate rows with hairlines | Zebra stripes, filled table headers, boxed settings |
| Show gains in green, losses with a minus and ink | Use red for money going out |
| Set cents small and raised | Show amounts at one flat size in summaries |
| Use the same icon for the same action | Mix icon sets, fill icons, or colour them for decoration |
