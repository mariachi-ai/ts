# Heather

Category: warm and friendly. Friendly and clean: charcoal text on white, one clear blue for the
action and the current place, 12px buttons, cards and video frames with 16px corners and a hairline,
pale-blue chips for timestamps, and a quiet grey for everything else. Dark mode is a warm charcoal
with a lighter blue that carries dark text. For team tools where people record, share and reply:
video messages, feedback, async updates.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the nine page shapes as HTML using only the library's classes;
- **`brief.md`** is the one-page summary, with [`patterns/`](./patterns/), [`never.md`](./never.md)
  and [`precedents/`](./precedents/index.md) for the depth;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `heather` preset of `@mariachi/design` (`data-theme="heather"`,
`themes/heather.css`).

## Principles

- **Friendly, not loud.** White space, rounded corners and plain words do the welcoming. Colour is
  kept for the one action, the current place and status.
- **One blue.** `#1868db` fills the primary button, marks the current tab and nav row, and colours
  links and timestamps. There is no second brand colour on screen.
- **Content first.** Videos are the cards. A card is the thumbnail, who made it and when, the title,
  and three small counts: views, comments, reactions. Nothing else competes.
- **Hairlines, then shadow.** Cards and panels are drawn with a 1px hairline and no shadow; only
  things that float (menus, the reaction bar, dialogs, flags) lift.
- **Say it plainly.** Sentence case, short, warm: "Start recording", "Nobody was invited yet".

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Canvas, cards, panels | white `#ffffff` | `#1f1f21` |
| Wells: behind the video, quiet panels | `#f8f8f8` | `#18191a` |
| Menus, dialogs | white | `#2b2c2f` |
| Text: default, muted, subtle | `#292a2e`, `#505258`, `#6b6e76` | `#cecfd2`, `#a9abaf`, `#96999e` |
| Hairlines | `#dddedd` (ink at 14%); lighter `#f0f1f2` | `#37373a`; `#2b2b2e` |
| Input and checkbox borders | `#8c8f97` | `#7e8188` |
| Accent | `#1868db`, hover `#1558bc`, pressed `#144794`; white text | `#669df1`, hover `#8fb8f6`; text `#1f1f21` |
| Pale blue: current row, chips, selected | `#e9f2fe` | `#1c2b42` |
| Quiet fill: hover, segment track, skeletons | `#f0f1f2` | `#2b2b2e` |
| Success, warning, danger, info text | `#4c6b1f`, `#9e4c00`, `#ae2e24`, `#1558bc` | `#b3df72`, `#fbc828`, `#fd9891`, `#8fb8f6` |

- **Radius.**
  - 4px for badges, chips, checkboxes and keys;
  - 6px for nav rows, header links and tooltips;
  - 8px for inputs, selects, menus, transcript rows, alerts and flags;
  - 12px for buttons, the search field, the segment track and dialogs;
  - 16px for cards, the video frame and panels;
  - full for avatars, the play button and the public site's buttons.
- **Shadow.**
  - Resting cards: none.
  - Raised (segments, small lifts): a 1px drop and a 1px perimeter.
  - The reaction bar and a hovered card: `0 4px 10px` at 5%.
  - Menus and popovers: `0 8px 12px` at 15% with a 1px perimeter.
  - Dialogs and flags: that, plus a long soft `0 6px 24px` drop.
  - Dark mode adds a faint pale ring instead of relying on the drop.
- **Motion.** 150, 200 and 250 ms; `cubic-bezier(0.4, 0, 0, 1)` for most things and
  `cubic-bezier(0, 0.4, 0, 1)` for entrances. Nothing bounces.
- **Spacing.** An 8px rhythm on a 4px unit. The usual gaps are:
  - 8px inside a control group and between a chip and its text;
  - 12–16px between cards in a grid and between fields;
  - 24px between page sections and around the video;
  - 40px page gutters on wide screens.
- **Layout.**
  - A 240px white sidebar with a hairline edge.
  - A top bar with a wide, rounded search field (40px, 12px corners).
  - Content is fluid up to 80rem; card grids use 17rem columns and 16px gaps.
  - The viewer page puts the video on the `#f8f8f8` well and a 435px side panel on the right.
  - Forms and onboarding sit in a 30rem column; settings to about 56rem.
- **Density.** 1 by default. For dense screens, set `--m-density: 0.875` on the page; controls and
  padding shrink together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Inter, variable, with its optical-size axis (`@fontsource-variable/inter/opsz.css`),
  for everything: body, labels and headings. At 14, 24 and 32px it sets the same widths as the
  reference's own face; the optical sizes tighten the headings, so load the opsz file.
- **Mono.** JetBrains Mono for codes and shortcuts.
- **Sizes:**
  - body 14px with a 1.57 line height (22px);
  - small text, hints, table headers and chips 12px;
  - large body and card titles 16px;
  - section headings 20px; the title of one thing (a video, a flow step, the sign-in card) 24px;
    page titles in the app 32px; all at 653;
  - public pages run their text at 16px, with a headline of 36–54px that shrinks with the window
    (about 3.4 times the text at 1440) and plan names at 40px; an article's title is 32px.
- **Weights: three, and only three, on every screen.** 400 for text; 500 for buttons, tabs, nav
  rows, field labels and avatars' initials; 653 for headings, titles, counts that matter, badges,
  table headers and sidebar group headings. There is no 600: `semibold` is set to 653, the same
  as `bold`.
- **Case.** Sentence case everywhere. Uppercase only for tiny promo tags on the public site
  ("TEAM FAVOURITE", "NEW").
- **Figures.** Durations and counts use tabular figures: `6:12`, `38 views`.

## Icons

- Lucide, outlined, **2px stroke** (the reference's icons are 1.5px on a 16px grid): 16px in
  buttons, tabs and inputs; 20px in the sidebar and the top bar; 28px in round empty and error
  badges. Never filled, except the play triangle.
- Sidebar rows and most buttons carry an icon before the label; icon-only buttons are ghost and
  square with an `aria-label`.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send`, refresh `refresh-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- Insights are simple: views over time as columns or a line in the blue, with no gridlines and
  12px subtle labels.
- **More series** step through blue, lime, purple, orange, deep blue and plum (the reference's own
  categorical order).
- Tooltips use the tooltip treatment: charcoal, white 12px text.

## States (every control)

- **Hover.** Quiet surfaces take the `#f0f1f2` fill (ghost buttons, nav rows, menu rows, secondary
  buttons); the primary deepens to `#1558bc`; a clickable card lifts with the soft shadow. Inputs
  keep their border.
- **Focus.** A 2px `#4688ec` ring, 2px outside, on keyboard focus only. Never remove it. Inputs
  also turn their border blue while focused.
- **Pressed.** One step darker than hover (`#dddedd`, `#144794`). Nothing moves.
- **Disabled.** Half opacity, no hover. Say why nearby when it matters.
- **Error.** The control's border turns red; the message goes under it in red 12px with a small
  `circle-alert` icon, and says how to fix it.
- **Loading.**
  - A button keeps its width; `aria-busy="true"` shows a small spinner in place of the label.
  - Lists and card grids show skeleton blocks in `#f0f1f2` at the cards' size and 16px corners.
- **Selected and current.** Pale blue `#e9f2fe` with blue text for the current nav row and the
  chosen tile; a 2px blue line under the current tab; a white raised segment on the grey track; a
  pale-blue row with a 1px blue border for the transcript line that is playing.

## Components

The library's components, as Heather draws them; the five newest, at the end of this section, are not drawn for Heather yet. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: fluid to 80rem, 50rem for settings, 30rem for forms;
- `m-split`, a 240px sidebar beside the main column (on the viewer page, the 435px side panel);
- `m-grid`, for video cards (17rem columns, 16px gaps) and folders (14rem, 12px);
- `m-stack` and `m-cluster`, for everything inside.

Sections are 24px apart.

**Actions and forms**
- **Button.** 12px corners, medium 14px labels, 36px by default, 32px (`sm`) in toolbars, 40px
  (`lg`) for Comment and Start recording.
  - **Primary:** solid blue, white text. At most two in view: one belongs to the frame (the
    sidebar's record button, or the site bar's primary) and at most one to the page ("New
    recording", "Invite", the favourite plan). A flow has just one.
  - **Secondary** (the default): white with a hairline and charcoal text ("New folder", "Save").
  - **Ghost:** no fill, muted text; for icon buttons and toolbars ("Copy", "Find").
  - **Danger:** solid red, only to confirm deleting.
  - **Share** on the viewer page is one primary; copying the link is a ghost icon button beside the
    title.
  - On the public site, buttons are full pills.
- **Input, textarea.** 36px, 8px corners, white, a 1px `#8c8f97` border. Focused: a blue border
  and the focus ring. The search field in the top bar is 40px with 12px corners and a search icon
  inside.
- **Select.** The same box as an input, with a chevron. Sort selects above a grid are `sm`.
- **Field.** The label above (14px, medium), the control, then the hint (12px subtle) or the error.
  Fields stack 16px apart.
- **Checkbox.** 16px, 4px corners, the input border; blue when checked.
- **Radio.** 16px with a 2px dark ring; chosen, the ring stays dark around the blue.
- **Switch.** 40 × 24, round; blue with a white knob when on (dark knob in dark mode), grey when off.
  It applies at once: no Save.

**Navigation**
- **Sidebar.** 240px, white, a hairline edge.
  - Top: the product wordmark and a collapse button, then the workspace switcher (a bordered box
    with the workspace's square avatar, name, member count and a chevron).
  - Rows are 15px medium (500) with a 20px icon, 6px corners and 6px above and below, so about
    36px tall; the current one is pale blue with blue text and icon, at the same weight. Counts sit
    right, subtle.
  - Groups are separated by a hairline; group headings are 12px bold (653) subtle, with a ghost `+`.
  - The record button sits at the bottom, solid blue and full width.
- **Navbar** (public pages). White, 60px, a hairline below; medium 14px links with 6px hover
  fills; Log in (secondary) and the primary at the right.
- **Top bar** (in the app). No fill: the search field on the left; notifications and the avatar on
  the right. On the viewer page it also holds the Share button, more and search.
- **Tabs.**
  - **Underline:** medium 14px in subtle grey, 16px apart; the current one blue over a 2px blue
    line, on a hairline. A count or a collapse button may sit at the right end.
  - **Pill** (segments): a `#f0f1f2` track with 12px corners and 4px padding; the chosen segment
    white, raised, 8px corners.
- **Breadcrumb.** Subtle 14px links with "/" between; the current page in medium charcoal. Usually
  a single muted line above the page title ("Library").
- **Pagination.** Rarely needed: libraries load more as you scroll. When used, ghost 8px buttons,
  the current one pale blue with blue text.

**Data and content**
- **Table.**
  - No frame and no header fill; 12px bold (653) subtle headers in sentence case.
  - Rows are 14px, hairline-separated, with a faint `#f8f8f8` hover.
  - A checkbox column on the left, avatars beside names, roles as badges, dates and emails muted,
    a ghost `ellipsis` button at the end.
- **Card.** White, 16px corners, a hairline, no shadow; 16px padding.
  - A video card puts the thumbnail flush at the top (one picture, painted from token colours), then the author's avatar with "name · when"
    and the sharing state, the title at 16px bold, and the counts row (eye, comment, smile icons).
  - The duration chip sits bottom right on the thumbnail: charcoal, white 12px bold, 8px corners.
  - A clickable card lifts with the soft shadow on hover.
- **Badge.** 20px tall, 4px corners, 12px bold (653), sentence case: grey ("Creator"), blue ("Admin",
  "New"), amber ("Invited"), green, red.
- **Avatar.** Round, medium initials on pale blue in blue text; square with 4–8px corners for a workspace.
  24px in rows, 32px in bars, 40px in headers; stacked groups overlap with a white ring.
- **Divider.** A hairline. Settings sections are separated by hairlines, not boxes.
- **Accordion.** Hairline rows, 16px medium questions, a chevron on the right. No fills.
- **Code, kbd.** JetBrains Mono at 12px; blocks on `#f8f8f8` with 8px corners and a hairline;
  inline code on the quiet fill with 4px corners. Keys are small 4px grey boxes in medium sans.
- **Prose.** 14px body, 1.57 line height, at most about 68 characters a line, links in blue.
- **Progress.** A round 4–6px bar: blue on the quiet fill. The video's own progress is a 4px blue
  line along the bottom of the frame.
- **Meter.** The same bar; it turns amber, then red, past its marks (the microphone level).
- **Usage.** A label and amount over a meter bar ("23 of 30 videos").

**Feedback and overlays**
- **Alert.** A pale tint in the tone, no border, 8px corners, 16px padding; the coloured icon on the
  left and a bold title. Danger alerts sit above the form and say what was not done.
- **Toast** (a flag). White, 8px corners, the overlay shadow, no border; the coloured status icon,
  a bold title, one line of detail and one action ("Retry", "Undo", "View"). Success flags close
  themselves; error flags stay.
- **Dialog.** White, 12px corners, 24px padding, over the 46% navy blanket. A 20px bold title;
  actions on the right, primary last, Cancel as ghost.
- **Popover and menu.**
  - White, 8px corners, the overlay shadow, 6px top and bottom padding.
  - Full-width 36px rows at 14px with a 16px icon; hover is the quiet grey.
  - Small subtle group labels ("Open in"), hairlines between groups; a destructive item in red.
- **Tooltip.** Charcoal (`#292a2e`) with white 12px medium text, 6px corners and a soft drop; after
  300ms.
- **Spinner.** A thin blue ring, inside buttons and small areas only.
- **Skeleton.** Quiet-grey blocks at text and card sizes (cards keep their 16px corners), with a
  soft shimmer that stops under reduced motion.

**AI and chat**
- **Chat** (comments and the assistant). No bubbles for others: avatar, bold name, the pale-blue
  time chip ("0:48"), the text, then Reply and React in small subtle links. Your own messages sit on
  pale blue with 12px corners.
- **Composer** (the comment box). 12px corners, the input border, a 2px blue edge while typing;
  ghost buttons for a video reply and a reaction; Post as a small primary.
- **Thinking.** A muted "Writing a summary…" line with a soft pulse, beside the sparkles icon.
- **Tool call.** A hairline row with 8px corners, a 16px icon, the step's name and its status badge.
- **Citation.** A small pale-blue chip with a number or a timestamp, the source in a popover.
- **Usage**, as above.
- **Row, chip, icon tile, amount and drop zone** (`m-row`, `m-chip`, `m-tile`, `m-amount`,
  `m-dropzone`): newer than this language and not drawn for it yet. Until they are, use them with
  Heather's tokens and the library defaults, and where a pattern above already describes rows,
  chips, tiles or money figures, follow the pattern.

## Error handling

- **In a field:** the border turns red and the message replaces the hint, with a small icon.
  Validate on blur and on submit, never while someone is typing.
- **In a form:** a danger alert above it, counting what needs fixing and saying what was not done
  ("Nobody was invited yet"). Focus moves to it.
- **Somewhere else:** a flag with what happened, whether anything was lost, and one action ("Upload
  stopped at 64% · Retry").
- **A whole page:** inside the app frame (sidebar and top bar stay), centred in the content
  column, with a 64px round grey badge holding a 28px outline icon, the code in small mono, a 32px
  bold title, one sentence and one or two buttons.
  - **404:** "We can't find that video", with Back to the library.
  - **500:** "Something went wrong on our side" and "nothing was changed", with Try again.
  - **403:** "This video is private", naming who shared it, with Request access.
- **Words.** Say what happened, whether anything changed, and what to do. Warm and direct; no
  codes in sentences, no blame, no exclamation marks.

## Page shapes (recipes)

### The families

| | The app (dashboard, settings, empty state, errors) | The video page (list and detail) | Flows (onboarding, sign-in) | Public pages (pricing, reading) |
| --- | --- | --- | --- | --- |
| Frame | The 240px white sidebar (wordmark, workspace switcher, rows, channels, the record button at the bottom) and a bare top bar with the 40px search. Empty and error pages keep it | A white top bar (sidebar toggle, wordmark; Share, more, search, notifications, avatar), a title band, and the 435px side panel on the right | No sidebar, no top bar: the wordmark above one column | The 60px white site bar: wordmark, four medium links, Log in and the one primary; the footer of link columns at the end |
| Column | Fluid to 80rem; settings to 56rem; errors to 50rem | The video on the grey well, 24px around it | 30rem (onboarding) or 26rem (sign-in), centred | Pricing to 80rem; an article 50rem with its text at 40rem |
| Titles | 32px at 653 under a muted context line ("Library") | 24px at 653 with "author · date" under it | 24px at 653 | A 36–54px headline at 653 (pricing), 32px for an article; plan names 40px |
| Text | 14px, labels 14px medium, small 12px | 14px; transcript lines 14px with blue 12px times | 14px | 16px |
| Buttons | 12px corners; the sidebar's record button and at most one more solid blue for the page | Share is the one solid blue | One full-width solid blue | Full pills; the favourite plan solid blue, the others pale blue |
| On a phone | The page comes first; the sidebar drops below it | The video and title first; the side panel below | The column fills the width | The site bar keeps the wordmark and the two buttons; plans stack |

### Signature moves

1. **Three weights on every screen:** 400 text, 500 controls and labels, 653 headings. No 600.
2. **One blue, for the action and the current place:** the solid buttons (the record button and the
   page's one action), the current nav row (pale blue, blue text), the current tab (blue over a 2px
   line), links and times. Nothing else is coloured but status.
3. **The video leads:** the recording is a picture in a 16px hairline frame, on the grey well, with
   a round blue play button; thumbnails lead every card with a charcoal duration chip.
4. **The side panel of tabs:** Comments, Transcript, Details at the right of the video; the playing
   transcript line pale blue with a 1px blue edge.
5. **Hairlines, then shadow:** cards, folders, panels and the video frame have a hairline and 16px
   corners and no shadow; only what floats (the reaction bar, menus, flags, dialogs) lifts.
6. **12px buttons in the app, pills on the public site.**
7. **The app frame stays:** sidebar and the wide search on every app page, empty and error included.

### How a screen is assembled

- **It opens with** the frame, then a muted context line over the 32px title on the left and the
  page's actions on the right (secondary first, the one primary last). The video page opens with its
  title band; public pages with the site bar and a centred headline; flows with the wordmark.
- **Reading order:** the title, then tabs or the controls that shape what follows (underline tabs
  with a count at the right end, sort selects), then the things themselves (folders, then the card
  grid; or titled settings sections on hairlines).
- **How much one screen does:** one area. The library shows folders and videos; the video page
  shows one video with its conversation; settings show one workspace, section by section.
- **When narrow:** the page comes first and the sidebar drops below it; card grids go to one column;
  the side panel drops below the video; actions wrap under the title.
- **Too much content:** grids load more as you scroll, with the count beside the tabs; settings add
  tabs across the top, never a second sidebar.
- **None:** the frame and the title stay; a soft grey well in the content column holds a 64px
  pale-blue circle with an outline icon, a 20px heading, one sentence and the primary.

### The recipes

- **Dashboard** (the library).
  - The frame: sidebar, then the top bar with the wide search.
  - A muted "Library" line over the 32px title; New folder (secondary) and New recording (primary,
    with a chevron) on the right.
  - Underline tabs with the count at the right end, then folders as small bordered tiles, then the
    video card grid with sort selects.
- **List and detail** (the video page).
  - A white top bar with Share as the one primary; a white title band: the 24px title, "author ·
    date", a bordered viewers chip with stacked avatars, copy-link and download icon buttons.
  - The video on the grey well with 16px corners and a round blue play button.
  - The reaction bar (a floating card of emoji buttons) beside Comment.
  - The summary with time chips, up next, then comments and the comment box.
  - On the right, the 435px white side panel: underline tabs (Transcript current), a ghost toolbar,
    and the transcript lines with blue times, the playing line pale blue with a blue border.
- **Onboarding.** A 30rem column: the wordmark and "Step 3 of 3", a thin progress bar, a 24px
  title and one muted line, choice tiles (the chosen one pale blue with a blue edge), then the
  recorder panel: pill segments for what to record, camera and microphone selects with a level
  meter, the camera-bubble switch and a large Start recording button.
- **Settings.** In the frame: the 32px title under a muted workspace line, underline tabs, then titled
  sections separated by hairlines: name with Save, icon upload, radios for who can watch, switches
  that apply at once, the members table with search and Invite, and Delete last.
- **Empty state.** In the frame: a breadcrumb and the 32px title with Add people, then a soft grey
  well with a 64px pale-blue circle and a video icon, a 20px heading, one sentence, Start recording
  and Upload a video.
- **Pricing.** The site bar, a 36–54px centred headline, team size and a Monthly/Yearly segment
  with a "Save" tag, four roomy cards with 32px corners (the favourite pale blue with a blue edge and
  an uppercase tag), pill buttons, check lists, questions and the footer.
- **Errors.** In the frame: the share form with its summary and field errors, a flag with Retry,
  then not found, failure and no access as centred blocks.
- **Reading.** The site bar; a breadcrumb, a 32px title, the byline with copy-link and bookmark
  icon buttons, a lede; the video on the grey well; its chapters as transcript rows; then 16px text
  with 20px section headings, a "Did this help?" row and the footer.
- **Sign-in.** The wordmark over one white hairline card: a 24px title and one muted line, the email
  field, Continue as the one full-width primary, then two other ways in (secondary, full width)
  under a hairline; a line to create an account and the fine print below.

## Words

- Plain and warm, sentence case: "Start recording", "Who can watch new videos", "Nobody was invited
  yet".
- Times as people say them: "2 days ago", "Last week", "Nov 10, 2026"; durations as `6:12`.

## Do and don't

| Do | Don't |
| --- | --- |
| Keep one blue for the action and the current place | Add a second accent or colour nav icons |
| Use three weights: 400, 500 and 653 | A fourth weight, or 600 |
| Keep the sidebar and search on empty and error pages | Drop the frame for a bare centred page |
| Draw cards with a hairline and 16px corners | Give resting cards a drop shadow |
| Use 12px buttons in the app | Square 2–4px buttons, or pills inside the app |
| Show time as pale-blue chips with blue figures | Plain grey timestamps in transcripts and comments |
| Treat thumbnails as content: the video leads each card | Crowd cards with buttons; actions live in the menu |
| Highlight the playing transcript line in pale blue with a blue edge | Bold or colour the whole line's text |
| Write warm, plain sentences that say what happened | Codes, blame or exclamation marks |
