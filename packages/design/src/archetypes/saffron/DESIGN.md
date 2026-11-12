# Saffron

Category: warm and friendly. Sunny and plain-spoken: a signature yellow as the brand colour, a deep
teal for every action and link, graphite text on white cards over a near-white page with cool grey
hairlines and fills, a sturdy serif for public headings and friendly moments beside a plain grotesque, 6px controls and flat bordered
cards. For marketing, newsletter and small-business tools that should feel warm and cheerful without
getting in the way.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `saffron` preset of `@mariachi/design` (`data-theme="saffron"`,
`themes/saffron.css`).

## Principles

- **Yellow is the brand, teal is the action.** The yellow (`color.brand.default`) marks the product: a
  4px stripe across the top of the app, a highlight under one word, the help band and the big pill
  buttons on public pages. Inside the app every action, link, focus ring and selected control is
  teal. Never make an in-app button yellow, and never make a link yellow.
- **Plain and flat.** White pages, white cards with a hairline and no shadow, flat tints for status.
  Colour blocks are solid; there are no gradients.
- **The serif is for warmth, not work.** Public headlines, onboarding questions, empty-state and
  error headings use the serif. The app itself, figures included, is the plain grotesque at 400 and
  500.
- **Say it like a person.** Sentence case, short, friendly words. Explain terms where they appear:
  a term with help behind it has a dashed teal underline.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Page, cards and bars, menus | page `#f8fafb`; cards, top bar, sidebar and menus white | `#181c1f`, cards `#21262a`, menus `#2b3135` |
| Quiet fill: panels, hover, segmented track | `#f0f4f6` | `#2b3135` |
| Text: default, muted, subtle | `#21262a`, `#4c555b`, `#6a757c` | `#ffffff`, `#d5dee3`, `#adbac2` |
| Hairlines | `#e2e9ed`; lighter `#f0f4f6` | `#3c4348`; `#2b3135` |
| Input borders | `#c3ced5`, graphite on hover | `#5d686f` |
| Action and link teal | `#017e89`, hover `#006771`, pressed `#005056` | `#00b3c2` with dark text |
| Brand yellow, ink on it | `#ffe01b`, `#241c15`; pale `#fff9d1` | the same yellow; pale `#615e31` |
| Gained, attention, lost, info | green `#00892e`, orange `#c84f00`, red `#db334d`, violet `#7c00f6` | `#00a63b`, `#f88a42`, `#f7576c`, `#a275ff` |
| Tints for those | `#d2f8d5`, `#ffeac7`, `#ffe7e7`, `#f0e9ff` | `#005419`, `#651e00`, `#6e0b1e`, `#490097` |
| Highlight blue (selection, "most popular") | `#c5e1ff` | `#17497f` |

- **Radius.** 4px for inputs, badges, alerts, checkboxes and tooltips; 6px for buttons, nav rows and
  segmented controls; 8px for menus and dialogs; 12px for cards. Pills only on public pages.
- **Shadow.** Rare. Cards are flat. Menus and the snackbar lift on a soft graphite shadow
  (`0 4px 16px` at 20%); dialogs on `0 6px 24px`.
- **Motion.** 150, 200 and 350 ms. Things ease into place (`cubic-bezier(0.35, 0, 0.25, 1)`);
  entrances may overshoot a touch (`cubic-bezier(0.15, 1.4, 0.25, 1)`).
- **Spacing.** A 4px unit, stepping 4, 8, 12, 16, 24, 32, 48, 64:
  - 8–12px inside a control group;
  - 16–20px between fields;
  - 24px card padding and grid gaps;
  - 32–48px between page sections.
- **Layout.**
  - A 4px yellow stripe, then a white top bar with the wordmark, a centred search, Help and the
    avatar, with a hairline under it.
  - A 216px white sidebar with a hairline edge; the page between them is `#f8fafb`.
  - Content to 78rem (1248px), with a gutter of `clamp(1rem, 3vw, 2.5rem)`; forms in 30rem, settings
    in 48–60rem.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.85` on the page.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-color-brand-default)`.
The exact scales are in the reference at the end.

## Type

- **Families.** Public Sans (variable) for everything in the product, figures included, at 400 and
  500 only. Fraunces (variable) for public headlines, onboarding, empty-state and error headings, at
  500, tracked −0.02em.
  Roboto Mono for codes and IDs.
- **Sizes:**
  - body 16px with a 1.4 line height; inputs, buttons, table cells and labels 14px;
  - small print 12px;
  - section titles 20px at 500; page titles 28px at 500, tracked −0.02em;
  - figures 28px at 500; public headlines 40px and 48px in the serif.
- **Case.** Sentence case everywhere, including buttons and tabs. No capitals-only labels.
- **Help terms.** A term with an explanation behind it gets a 2px dashed teal underline, offset 5px.
- **Figures** use `font-variant-numeric: tabular-nums` in tables.

## Icons

- Lucide, outlined, **1.5px stroke**: 20px in the sidebar, 16px in buttons and beside text, 18px for
  section info icons, 40px in empty tiles and error pages. Icons are in the text colour; only status
  icons take a tone.
- Every sidebar item has an icon; nested items don't.
- Change is an arrow inside a tinted badge (↑ green, ↓ red), never colour alone.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis-vertical`, close `x`;
  - back `arrow-left`, forward `arrow-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** columns. All bars pale (30%) except the one picked, which is solid with a small
  graphite flag above it. Hairline baseline, dashed hairline gridlines, dates underneath in muted 14px.
  In the recipes the series is the action teal; in an app with its own chart colours, use the blue.
- **More series** step through blue `#3492ef`, teal `#009eac`, orange `#e56c1d`, coral `#f7576c`,
  violet `#a275ff` and deep blue `#205ea3`, with the legend below as small squares and labels.
- Tooltips use the tooltip treatment.

## States (every control)

- **Hover.** Secondary buttons and nav rows take the grey fill `#f0f4f6`; primary deepens from
  `#017e89` to `#006771`; input borders turn graphite; links deepen. Nothing lifts.
- **Focus.** A 2px teal ring outside the control, on keyboard focus. Inputs also turn their border
  teal. Never remove it.
- **Pressed.** One step darker again (`#005056`; `#e2e9ed` for secondary).
- **Disabled.** Half opacity; inputs take a grey fill. Say why nearby.
- **Error.**
  - The control's border turns red.
  - The message replaces the help text under the field, in red 14px, saying how to fix it.
- **Loading.**
  - A button keeps its width and label; `aria-busy="true"` shows a small spinner and blocks clicks.
  - Lists and cards show grey skeleton blocks.
- **Selected and current.** Nav rows: the grey fill `#e2e9ed`, 500 weight. Tabs: teal text and a
  teal underline. Segmented: a white segment on the grey track. Checked controls: teal.

## Components

All 36 of the library's components, as Saffron draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 78rem, or 48rem for settings and 30rem for forms;
- `m-split`, the 216px sidebar beside the page;
- `m-grid`, for cards: 24px gaps;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 6px corners, 14px at 500, 40px by default and 32px (`sm`) in rows and bars.
  - **Primary:** solid teal, white text, one per view.
  - **Secondary** (the default): white with a light grey border, graphite text.
  - **Ghost:** teal text with no box, for quiet actions ("Cancel", "Back").
  - **Danger:** solid red, only to confirm something destructive.
  - **Public pages** use pills: yellow with warm ink and a 1px ink edge for the main one, a 1px ink
    outline for the other (recipe styles on `m-button`, from the brand tokens).
- **Input, textarea.** 40px, 4px corners, white, a `#c3ced5` border that turns graphite on hover and
  teal on focus. Placeholder in subtle grey.
- **Select.** The same box with a chevron.
- **Field.** The label above in muted 14px at 400, the control, then the hint or the error. Fields
  stack 20px apart; short pairs (city, postcode) can sit side by side.
- **Checkbox, radio.** 20px, 4px corners on the checkbox, a graphite-grey border, teal when checked.
- **Switch.** 44 by 24px, a grey track that turns teal, a white knob. It takes effect at once.

**Navigation**
- **Sidebar.** 216px, white, a hairline edge.
  - Top: a secondary "Write" button the full width, with a pencil.
  - Items are 16px in muted text with a 20px icon; the current one is graphite at 500 on `#e2e9ed`
    with 6px corners. Nested items sit under their parent, indented, without icons.
  - Counts are muted on the right; "New" is a violet badge.
- **Navbar** (public pages). White, 66px, a hairline under it. A serif wordmark, small 13px bold links
  in ink that take a pale yellow fill on hover, and pill buttons at the right.
- **Top bar** (in the app). Under the yellow stripe: the wordmark, a centred search field with an
  icon, then Help (a small secondary button), notifications and the avatar.
- **Tabs.**
  - **Underline:** 16px at 500, graphite, the current one teal with a 2px teal line.
  - **Pill** (segmented): a grey track with 3px padding and a white segment on a soft shadow.
- **Breadcrumb.** Teal links with "/" between, the current page in graphite.
- **Pagination.** Arrow buttons and page numbers as quiet 6px squares; the current one solid teal.

**Data and content**
- **Table.**
  - No frame and no header fill; headers are graphite 14px at 500, in sentence case.
  - Rows are 14px, separated by hairlines, with a faint hover.
  - The first column is a teal link; statuses are badges; groups are grey tags.
  - A checkbox column comes first when rows can be selected.
  - Comparison tables on public pages are framed and striped.
- **Card.** White on the near-white page, 12px corners, a hairline, no shadow, 24px padding. Section titles sit above the
  card, not inside it, with an info icon and a teal "See all →" link on the right.
- **Badge.** 4px corners, 24px tall, 14px at 400, a flat tint with no border:
  - grey for tags and neutral states ("Draft");
  - green ("Sent", "Opted in"), orange ("Ongoing", "Waiting to confirm"), red ("Opted out");
  - violet for "New".
  - Change badges carry an arrow.
- **Avatar.** Round, the person's initial in the serif on the pale yellow.
- **Divider.** A hairline.
- **Accordion.** Hairline rows, the question at 20px, a chevron on the right. No boxes.
- **Code, kbd.** Roboto Mono on the grey fill with 4px corners; keys have a hairline border.
- **Prose.** 16px with a 1.6 line height, at most 68 characters a line, links in teal.
- **Progress.** An 8px bar: teal on a grey track.
- **Meter.** The same bar; it turns orange then red past its marks.
- **Usage.** A label and amount over a meter bar.

**Feedback and overlays**
- **Alert.** A flat tint with no border and 4px corners; an 18px status icon, the title at 500 and
  the body in the tone's text colour. Danger alerts sit above the form and say what was not done.
- **Toast.** The snackbar: graphite with white text, 6px corners, a soft shadow, one action.
- **Dialog.** White, 8px corners, 32px padding, a 50% black scrim. The title is 24px at 500. Actions on
  the right: primary last, Cancel as a ghost.
- **Popover and menu.** White, 8px corners, a hairline and a soft shadow; 40px rows edge to edge,
  14px, with the grey fill on hover; hairlines between groups; a destructive item in red.
- **Tooltip.** Graphite with white 14px text, 4px corners, no arrow.
- **Spinner.** A teal ring, 3px thick, inside buttons and small areas only.
- **Skeleton.** Grey blocks with a soft shimmer that stops under reduced motion.

**AI and chat**
- **Chat.** The person's messages in teal bubbles with white text; replies in grey bubbles; 12px
  corners. The assistant's avatar is the yellow with ink.
- **Composer.** A white box with 8px corners and a control border that turns teal while typing; send is
  the primary button.
- **Thinking.** A muted line with a soft pulse. **Tool call:** a hairline-bordered row with an icon,
  the tool name and its status badge.
- **Citation.** A small grey tag with a number; the source in a popover on hover.
- **Usage**, as above.

## Error handling

- **In a field:** the border turns red and the message replaces the hint. Check on blur and on
  submit, never while someone is typing.
- **In a form:** a danger alert above the form that counts what needs fixing and says nothing was sent
  ("Fix 2 things before this can be scheduled. Nothing has been sent."). Each field shows its own
  message.
- **Somewhere else:** the snackbar, with what happened and one action ("Verify").
- **A whole page:** centred, a 40px outline icon, "Error 404" in small mono, a 40px serif title, one
  sentence and one or two buttons.
  - **404:** "We can't find that page", with Go to overview.
  - **500:** "Something went wrong on our end" and "Nothing was changed", with Try again.
  - **403:** "This part is for account owners", with Ask for access.
- **Words.** Say what happened, whether anything changed, and what to do next, kindly. No blame, no
  codes in sentences, no exclamation marks in errors.

## Page shapes (recipes)

- **Dashboard.** The title with a secondary and a primary action; a "Showing" period select; a card of
  four metrics split by hairlines (icon, dashed term, 28px figure, change badge); a bar chart card
  beside a sales card; a frameless table of recent sends with "View results" buttons.
- **List and detail.** The title with Import and Add; one line of help with a teal link; status tabs
  with counts; search, filter select and "More filters"; the table; a count and pagination. A row
  opens the contact's page: breadcrumb, name and serif-initial avatar, a details card and an activity list.
- **Onboarding.** Under the stripe, a narrow column with "Step 2 of 4", a teal progress bar, a serif
  question, fields and bordered choices, Back as a ghost and Continue as the primary; beside it a
  yellow panel built from simple token shapes and one serif line.
- **Settings.** Underline tabs; sections split by hairlines, the title and why on the left and fields
  on the right; switches for notifications; Save on the right; closing the account last.
- **Empty state.** A grey panel with a serif heading, one sentence, a primary and a ghost button; then
  three tiles on flat tints with one icon each.
- **Pricing.** The public bar; a pill switch; a serif headline with one word underlined in yellow; a
  yellow help band; square plan columns split by hairlines, a blue "Most popular" band, serif names
  and prices in a bordered box, yellow pill buttons; a framed, striped comparison with dashed terms;
  questions as hairline rows.
- **Errors.** The field, form, snackbar and full-page errors above, as one page.

## Words

- Friendly and plain: "Write", "New email", "See how journeys work", "Your first email can go out
  today."
- Explain without jargon; dates short ("Nov 10, 2026").

## Do and don't

| Do | Don't |
| --- | --- |
| Keep the yellow for the brand stripe, highlights and public pill buttons | Make in-app actions or links yellow |
| Use teal for every action, link, focus and selection | Introduce a second action colour |
| Put public headlines and friendly headings in the serif | Set body text, figures, buttons or tables in the serif |
| Keep cards flat with a hairline | Add shadows to cards, or gradients anywhere |
| Use 6px buttons in the app and pills only on public pages | Pill buttons inside the app |
| Underline help terms with a dashed teal line | Hide explanations behind unmarked words |
| Use simple token shapes and flat colour blocks for decoration | Draw mascots, characters or illustrations |
