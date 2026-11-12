# Broadsheet

Category: editorial and warm-neutral. Reading first: graphite ink on white, a serif for what is read
and a clean grotesque for everything around it, one bright orange that means subscribe, 8px corners,
hairlines at 10% black and quiet grey chrome. For publishing, newsletters and memberships.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `broadsheet` preset of `@mariachi/design` (`data-theme="broadsheet"`,
`themes/broadsheet.css`).

## Principles

- **The words come first.** Posts are set in a serif at 19px with a 1.6 line height in a 728px column.
  Everything that isn't the writing (navigation, buttons, meta, comments) is a quiet grotesque, so the
  page reads like print with an interface around it, not the other way round.
- **One orange, and it means subscribe.** The signature orange marks the brand, the chart and the
  chosen plan; its deeper step fills the one action that matters on a screen. Everything else is ink,
  grey and white.
- **Quiet chrome.** White surfaces, hairlines at 10% black, grey fills for secondary buttons and the
  current row, no gradients, no heavy shadows. Cards are framed by a hairline, not lifted.
- **Small, uppercase meta.** Dates, bylines and comment actions are 11px uppercase with a little
  tracking. Titles are bold; nothing else is.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas and surfaces | white `#ffffff`; quiet panels and unselected tiles `#fafafa` | `#161718`; raised `#1b1c1d` |
| Text: default, muted, subtle | graphite `#363737`, `#727272`, `#757575` | `#eeeeee`, `#a2a3a3`, `#8b8c8c` |
| Hairlines | `#e6e6e6` (black at 10%); lighter `#f0f0f0` | `#2d2e2f` (white at 10%); `#232525` |
| Control border | `#929292` | `#717272` |
| Grey fill: secondary buttons, current row, tags | `#eeeeee`, hover `#dbdbdb` | `#232525`, hover `#363737` |
| Brand (the signature orange) | `#ff6719`, with near-black `#1c0c01` text on it | the same |
| Action orange (buttons, links, checked) | `#cd4900`, hover `#b43e00`, pressed `#a53800`; link text `#b43e00` | the same fills; link text `#ff853d` |
| Focus | blue `#005dd9` | `#3d8bff` |
| Success, warning, danger, info | green `#006c41`, amber `#6e5400`, red `#b23538`, blue `#0052c2`, each on its tone at 20% | `#52dd98`, `#ffdf41`, `#ff7772`, `#5390ff` |

- **Radius.** 4px for tags, tooltips and segments; 8px for buttons, inputs, alerts, menus and the
  current nav row; 12px for cards, tables and dialogs. Reaction buttons under a post are full pills.
- **Shadow.** Almost none. Cards are flat with a hairline. Menus take a `0 10px 15px -3px` soft drop,
  dialogs a longer one; a chosen plan card and a hovered card take the medium drop. In dark mode, the
  drops add a 1px white-at-10% ring.
- **Motion.** 125, 250 and 500 ms on `cubic-bezier(0.19, 1, 0.22, 1)`, a long ease-out; drawers use
  `cubic-bezier(0.32, 0.72, 0, 1)`. Nothing bounces.
- **Spacing.** A 4px unit. The usual gaps are:
  - 4–8px inside a control group and between icon and label;
  - 16–20px between fields and inside setting rows;
  - 24px between cards and sections of a page;
  - 48–64px between the parts of a long page (the list and the post, the post and its discussion).
- **Layout.**
  - The writer's workspace: a 232px white sidebar with a hairline edge, then content to about 64rem.
  - The reader's pages: a 72px masthead with the publication's name centred, underline tabs under it,
    and one 728px (45.5rem) column.
  - Forms and onboarding in a 30rem column.
  - Grids gap 16px.
- **Density.** 1 by default. For dense data screens, set `--m-density: 0.85` on the page; controls and
  padding shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Families.**
  - **Inter** for the whole interface (load the variable font, `@fontsource-variable/inter`, so its
    optical sizes match the reference's system grotesque at both 11px and 32px).
  - **Spectral** for what is read: post bodies, long descriptions, quotes. It's `--m-font-family-serif`;
    put it on the `m-prose` block (`style="font-family: var(--m-font-family-serif)"`).
  - **JetBrains Mono** for codes, figures in tables of raw data and error codes, small.
- **Sizes:**
  - the post body 19px serif, line height 1.6;
  - interface text 15px with a 20px line (1.4), secondary text 13px;
  - meta 11px uppercase at 500, tracked 2% ("NOV 10 · ODILE BRANNOCK");
  - post titles 32px bold, line height 1.125; subtitles 19px in muted grey at 400;
  - page titles and the masthead 24px bold; section titles 20px bold; card titles 19px bold;
  - list titles in an archive 20px bold.
- **Weights.** 400 for text, 500 for nav and meta, 600 for buttons, labels and tabs, 700 for titles.
- **Case.** Sentence case everywhere, except the 11px meta and the sidebar's group labels.

## Icons

- Lucide, outlined, **2px stroke** (Lucide's own weight, which the reference uses): 16px in buttons,
  nav rows and inputs; 18px in the reaction pills; 20px for icon buttons in bars; 40px for empty states
  and full-page errors. Never filled, never coloured except the status ones and the orange heart of a
  liked comment.
- Every sidebar row carries an icon; the settings list doesn't.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal, as a quiet icon button), close `x`;
  - back `arrow-left`, forward `chevron-right` ("See all ›", "Maybe later ›"), expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right`;
  - send `send`, refresh `refresh-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.
- On a post: like `heart`, comment `message-circle`, restack `repeat-2`, share `share`, paid `lock`.

## Charts

- **One series:** a 2px line in the signature orange over a fade of itself (24% to 2%), with faint
  hairline gridlines and dates underneath in muted 13px.
- **Compared with typical:** the orange bar beside a light grey bar.
- **More series** step through orange, blue, green, purple, yellow and grey.
- Stat tiles sit in a row above the chart: the chosen tile is white with a 3px orange rule on top, the
  rest on `#fafafa`; a change is a small tag, green when it's up.

## States (every control)

- **Hover.** Grey fills deepen one step (`#eeeeee` to `#dbdbdb`); the orange goes one step deeper;
  ghost buttons and nav rows take the grey fill; text links underline. No lift.
- **Focus.** A 2px blue ring outside the control, on keyboard focus only (the reference's "select"
  blue, not the orange). Inputs also turn their border blue. Never remove it.
- **Pressed.** One step darker than hover. Nothing moves.
- **Disabled.** Half opacity on a grey fill. Say why nearby.
- **Error.**
  - The control's border turns red.
  - The message replaces the help text under the field, in red 13px, and says how to fix it.
- **Loading.**
  - A button keeps its width and its label; `aria-busy="true"` swaps the label for a small spinner.
  - Lists and cards show grey skeleton blocks, never a spinner over the whole page.
- **Selected and current.** The grey fill and an 8px radius (nav, segments); the chosen plan card
  takes an orange edge; checked controls are the action orange.

## Components

All 36 of the library's components, as Broadsheet draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: 64rem in the workspace, 45.5rem for reading, 30rem for forms;
- `m-split`, the 232px sidebar beside the main column;
- `m-grid`, for cards and stat tiles: 16px gaps, 20rem columns for cards and 12rem for tiles;
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** 8px corners, weight 600, 15px, 40px tall by default and 32px (`sm`) in bars.
  - **Primary:** the action orange with white text: Subscribe, Write, Continue. One per view.
  - **Secondary** (the default): the grey fill with ink text, no border.
  - **Ghost:** text only, for "Sign in" and quiet actions; grey on hover.
  - **Danger:** solid red, only to confirm something destructive.
  - **Icon-only:** square, ghost, 20px icon, with an `aria-label`.
  - Under a post, reactions are full pills with a hairline ring, muted text and a count.
- **Input, textarea.** 40px, 8px corners, white, a grey control border with a tiny drop; it darkens on
  hover and turns blue on focus. Placeholders are muted ("Type your email…").
  - **The subscribe form** joins the email field and the orange button in one box, the field's border
    in the action orange.
- **Select.** The same box as an input, with a chevron.
- **Field.** The label above (14px, 600), the control, then the hint or the error below in 13px. Fields
  stack 20px apart.
- **Checkbox, radio.** 18px, the checkbox with 4px corners, the action orange when checked.
- **Switch.** 40 × 24px, the control grey when off, the action orange when on, a white knob with a
  small drop. Settings switches take effect at once.

**Navigation**
- **Sidebar** (the writer's workspace). 232px, white, a hairline edge.
  - Top: the publication switcher (the mark, the name and an up-down chevron in a hairline box), the
    Overview row, then a full-width orange action with a chevron.
  - Groups under 11px uppercase labels in muted grey.
  - Rows are 15px with a 16px icon; the current one is on the grey fill at 600, 8px corners.
  - Counts are small grey pills on the right.
  - In settings: plain text rows with no icons, muted, and the current one in bold ink without a fill.
- **Navbar** (the publication's masthead). 72px, white, a hairline under it, the name centred in 24px
  bold, and on the right: search and share icon buttons, the orange Subscribe and a ghost Sign in.
- **Tabs.**
  - **Underline** (under the masthead, on profiles, in reports): 14px at 600, muted, the current one
    in ink with a 2px ink line, all over a hairline.
  - **Pill** (the segmented control: Newest, Most read): a hairline-ringed track with 3px padding and
    8px corners, segments 4px, the current one on the grey fill.
- **Breadcrumb.** Muted links with "/" between, the current page in ink at 600. Prefer a back link with
  an arrow ("← Overview").
- **Pagination.** Ghost 8px buttons, the current page on the grey fill. Archives prefer "See all ›" or
  loading more as you scroll.

**Data and content**
- **Table.** Inside a 12px hairline frame. Headers 13px at 500 in muted grey, sentence case, no fill;
  rows on hairlines, hovering to `#fafafa`; figures right-aligned in tabular numbers with the share in
  muted grey; kinds as tinted tags.
- **Card.** White, a hairline, 12px corners, no shadow; 20–24px padding. Titles 19px bold, with a muted
  link at the right ("See all", "Open report"). A clickable card takes the medium drop on hover.
- **Badge.** 4px corners, 12px at 500:
  - grey fill with ink text by default;
  - the tone at 20% with its text colour for kinds and changes ("Network", "↑ 6.1%");
  - outlined in the tone for small statuses ("Liked by …" in orange);
  - solid near-black for emphasis.
- **Avatar.** Round, on the grey fill with ink initials: 24px in dense rows, 36px beside comments and
  bylines, 56px on profiles. A publication's mark is a rounded square.
- **Divider.** A hairline. Archive rows and setting rows are separated by hairlines.
- **Accordion.** Hairline-separated rows, the question at 15px and 600, the chevron on the right; the
  answer in muted grey.
- **Code, kbd.** JetBrains Mono at 13px. Inline code on the grey fill with 4px corners; blocks on
  `#fafafa` with a hairline and 8px corners.
- **Prose.** The post body: Spectral at 19px, line height 1.6, ink, in a 728px column; links in ink,
  underlined; quotes with an orange rule on the left; section headings in the sans at 700.
- **Progress.** A 6px rounded bar in orange on the grey track; onboarding uses a row of short bars,
  one per step.
- **Meter.** The same bar; it turns amber, then red, past its marks.
- **Usage.** A label and amount over the same orange bar, the amount in tabular figures.

**Feedback and overlays**
- **Alert.**
  - The tone at 20% with a 20% hairline of the same tone, 8px corners, 12px 16px padding.
  - A 16px status icon on the left, the title at 600 and the body in the tone's text colour.
  - Danger alerts sit above the form they're about and say what wasn't done ("Your plan prices
    weren't saved").
- **Toast.**
  - The snackbar: an ink slab (`#363737`) with white 15px text, 8px corners, centred near the bottom.
  - One line and at most one action ("Retry", "Undo").
- **Dialog.** White, 12px corners, the long soft drop over a 50% black scrim; the title 20px bold;
  actions on the right, primary last, Cancel as ghost.
- **Popover and menu.** White, a hairline, 8px corners, the soft drop, 4px inner padding; items are
  15px rows with 4px corners that highlight on `#fafafa`; a destructive item in red at the bottom.
- **Tooltip.** Near-black (`#161718`) with white 12px text at 500, 4px corners, 5px 10px padding, no
  arrow.
- **Spinner.** A thin ring in the action orange, inside buttons and small areas only.
- **Skeleton.** Grey-fill blocks at text and image sizes, with a slow shimmer that stops under reduced
  motion.

**AI and chat**
- **Chat.**
  - The other side's messages are plain text on white, with no bubble.
  - Your own messages sit in a blue bubble (`#005dd9`, white text) with 12px corners, right-aligned,
    as the reference's direct messages do.
  - Timestamps are muted 12px.
- **Composer.** A white box with 8px corners and the control border, blue on focus. Send is a small
  orange button with the `send` icon; attachments are grey pills.
- **Thinking.** A muted line ("Thinking…") with a soft pulse. **Tool call:** a hairline row with a 16px
  icon, the tool name and a status tag.
- **Citation.** A small grey pill with a number; the source in a popover on hover.
- **Usage**, as above.

## Error handling

- **In a field:** the control turns red and the message replaces the help text. Validate on blur and
  on submit, never while someone is still typing. Under the joined subscribe form, the message says
  what to fix and that nothing was sent.
- **In a form:** a danger alert above the form, saying how many things need fixing and what wasn't
  done. Focus moves to it; each field shows its own message.
- **Somewhere else:** the snackbar, with what happened and one action ("Couldn't send the test email ·
  Retry").
- **A whole page:**
  - **404:** the page keeps its masthead; "Page not found" as a 32px bold title, one sentence, then the
    newest posts underneath, so the reader still has somewhere to go.
  - **500:** centred: a 40px outline icon, the code in small mono, a 24px bold title, "Your post is safe
    and nothing was sent", Try again and Contact support.
  - **403:** the paywall: a lock, "This essay is for paying readers", one sentence, a wide orange
    Subscribe and "Already a paying reader? Sign in".
- **Words.** Say what happened, whether anything changed, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard** (the writer's home).
  - The sidebar, then a header with the page title at 24px bold and search, messages, notifications
    and the avatar on the right, over a hairline.
  - A period select; a card of three stat tiles (the chosen one with the orange rule) over the area
    chart.
  - Two cards: the latest post with its three figures, and drafts. Then a sources table with tinted
    kinds.
- **List and detail** (the publication).
  - The masthead and underline tabs; the segmented sort with a search button.
  - Archive rows: a 20px bold title, a one-line description, 11px uppercase meta with a lock for paid
    posts, and a photo slot on the right; a small uppercase month label between months.
  - A row opens the post: title, subtitle, byline, the reaction pills, the serif body, the joined
    subscribe form, the pills again, then "Discussion about this post" with the comment box and the
    thread, replies indented behind a 2px hairline.
- **Onboarding.** One 30rem column: a row of step bars, Back as a ghost button, the orange mark, a 24px
  bold heading, fields one under another, a full-width orange Continue and "Skip for now ›".
- **Settings.** A plain settings list beside sections of hairline-framed cards; each setting a row
  with its label and help on the left and its control on the right. Closing the publication comes
  last, with a danger button.
- **Empty state.** In the workspace: a 40px outline icon, a 20px bold heading, one sentence, the orange
  action and a grey one.
- **Pricing** (the reader's plan chooser). A card with the mark, a 24px bold title, an ink pill switch
  (for me, for a team, as a gift), four plan cards with radio choices and check or cross lists (the
  chosen card on an orange edge, the free plan's missing parts struck through), a wide orange
  Subscribe, the renewal line, "Maybe later ›", then an FAQ.
- **Errors.** The field, form, snackbar and full-page errors above, as one page.

## Words

- Short and plain, sentence case: "Subscribe", "Write", "See all", "Maybe later".
- Dates short ("Nov 10"), with the year only when it isn't this year.

## Do and don't

| Do | Don't |
| --- | --- |
| Set what is read in the serif, at 19px and 1.6 | Set post bodies in the interface sans, or small |
| Keep the orange for subscribing, the brand and the chosen thing | Colour headings, icons or links orange for decoration |
| Frame cards with a hairline | Lift cards on shadows, or use gradients |
| Use the grey fill for secondary actions and the current row | Outline secondary buttons, or fill the current row in orange |
| Write meta small and uppercase | Make dates and bylines as large as the text |
| Focus in blue, with the ring outside | Remove the focus ring, or draw it in orange |
| Use the same icon for the same action | Mix icon sets, fill icons, or thin them below 2px |
