# Heather

Category: warm and friendly. Friendly and clean: charcoal text on white, one clear blue for the
action and the current place, 12px buttons, cards and video frames with 16px corners and a hairline,
pale-blue chips for timestamps, and a quiet grey for everything else. Dark mode is a warm charcoal
with a lighter blue that carries dark text. For team tools where people record, share and reply:
video messages, feedback, async updates.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
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
  - The viewer page puts the video on the `#f8f8f8` well and a 416px side panel on the right.
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
  - section headings 20px, the video title 24px, page titles 32px, at bold;
  - the public site's headings much larger (56px and up), bold, tight.
- **Weights.** 400 for text, 500 for buttons, tabs, nav and labels, 600 for small headers and
  badges, and the reference's own 653 for bold headings and titles.
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

All 36 of the library's components, as Heather draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-container`, the content column: fluid to 80rem, 50rem for settings, 30rem for forms;
- `m-split`, a 240px sidebar beside the main column (on the viewer page, the 416px side panel);
- `m-grid`, for video cards (17rem columns, 16px gaps) and folders (14rem, 12px);
- `m-stack` and `m-cluster`, for everything inside.

Sections are 24px apart.

**Actions and forms**
- **Button.** 12px corners, medium 14px labels, 36px by default, 32px (`sm`) in toolbars, 40px
  (`lg`) for Comment and Start recording.
  - **Primary:** solid blue, white text. One per view ("New recording", "Invite").
  - **Secondary** (the default): white with a hairline and charcoal text ("New folder", "Save").
  - **Ghost:** no fill, muted text; for icon buttons and toolbars ("Copy", "Find").
  - **Danger:** solid red, only to confirm deleting.
  - **Split:** Share and its link button sit together as one primary, with a thin divider.
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
  - Rows are 15px semibold with a 20px icon, 6px corners; the current one is pale blue with blue
    text and icon. Counts sit right, subtle.
  - Groups are separated by a hairline; group headings are 12px semibold subtle, with a ghost `+`.
  - The record button sits at the bottom, solid blue and full width.
- **Navbar** (public pages). White, 60px, a hairline below; medium 14px links with 6px hover
  fills; Log in (secondary) and the primary at the right.
- **Top bar** (in the app). No fill: the search field on the left; notifications and the avatar on
  the right. On the viewer page it also holds the split Share button, more and search.
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
  - No frame and no header fill; 12px semibold subtle headers in sentence case.
  - Rows are 14px, hairline-separated, with a faint `#f8f8f8` hover.
  - A checkbox column on the left, avatars beside names, roles as badges, dates and emails muted,
    a ghost `ellipsis` button at the end.
- **Card.** White, 16px corners, a hairline, no shadow; 16px padding.
  - A video card puts the thumbnail flush at the top, then the author's avatar with "name · when"
    and the sharing state, the title at 16px bold, and the counts row (eye, comment, smile icons).
  - The duration chip sits bottom right on the thumbnail: charcoal, white 12px semibold, 8px corners.
  - A clickable card lifts with the soft shadow on hover.
- **Badge.** 20px tall, 4px corners, 12px semibold, sentence case: grey ("Creator"), blue ("Admin",
  "New"), amber ("Invited"), green, red.
- **Avatar.** Round, initials on pale blue in blue text; square with 4–8px corners for a workspace.
  24px in rows, 32px in bars, 40px in headers; stacked groups overlap with a white ring.
- **Divider.** A hairline. Settings sections are separated by hairlines, not boxes.
- **Accordion.** Hairline rows, 16px medium questions, a chevron on the right. No fills.
- **Code, kbd.** JetBrains Mono at 12px; blocks on `#f8f8f8` with 8px corners and a hairline;
  inline code on the quiet fill with 4px corners. Keys are small 4px grey boxes in semibold sans.
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

## Error handling

- **In a field:** the border turns red and the message replaces the hint, with a small icon.
  Validate on blur and on submit, never while someone is typing.
- **In a form:** a danger alert above it, counting what needs fixing and saying what was not done
  ("Nobody was invited yet"). Focus moves to it.
- **Somewhere else:** a flag with what happened, whether anything was lost, and one action ("Upload
  stopped at 64% · Retry").
- **A whole page:** centred, with a 64px round grey badge holding a 28px outline icon, the code in
  small mono, a 32px bold title, one sentence and one or two buttons.
  - **404:** "We can't find that video", with Go to your library.
  - **500:** "Something went wrong on our side" and "nothing was changed", with Try again.
  - **403:** "This video is private", naming who shared it, with Request access.
- **Words.** Say what happened, whether anything changed, and what to do. Warm and direct; no
  codes in sentences, no blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard** (the library).
  - The shell: sidebar, then the top bar with the wide search.
  - A muted "Library" line over the 32px title; New folder (secondary) and New recording (primary,
    with a chevron) on the right.
  - Underline tabs with the count at the right end, then folders as small bordered tiles, then the
    video card grid with sort selects.
- **List and detail** (the video page).
  - A white title band: the 24px title, "author · date", a bordered viewers chip with stacked
    avatars, copy-link and download icon buttons.
  - The video on the grey well with 16px corners and a round blue play button.
  - The reaction bar (a floating card of emoji buttons) beside Comment.
  - The summary with time chips, up next, then comments and the comment box.
  - On the right, a white side panel: underline tabs (Transcript current), a ghost toolbar, and
    the transcript lines with blue timestamps, the playing line pale blue with a blue border.
- **Onboarding.** A 30rem column: the wordmark and "Step 3 of 3", a thin progress bar, a 32px
  title, choice tiles (the chosen one pale blue with a blue edge), then the recorder panel: pill
  segments for what to record, camera and microphone selects with a level meter, the camera-bubble
  switch and a large Start recording button.
- **Settings.** The 32px title under a muted workspace line, underline tabs, then titled sections
  separated by hairlines: name with Save, icon upload, radios for who can watch, switches that
  apply at once, the members table with search and Invite, and Delete last.
- **Empty state.** A soft grey well with a 64px pale-blue circle and a video icon, a 20px bold
  heading, one sentence, Start recording and Upload a video.
- **Pricing.** The public navbar, a huge bold centred heading, team size and billing radios with a
  "Save" tag, four roomy cards with 32px corners (the favourite pale blue with a blue edge and an
  uppercase tag), pill buttons, check lists, and questions below.
- **Errors.** The field, form, flag and full-page errors above, as one page.

## Words

- Plain and warm, sentence case: "Start recording", "Who can watch new videos", "Nobody was invited
  yet".
- Times as people say them: "2 days ago", "Last week", "Nov 10, 2026"; durations as `6:12`.

## Do and don't

| Do | Don't |
| --- | --- |
| Keep one blue for the action and the current place | Add a second accent or colour nav icons |
| Draw cards with a hairline and 16px corners | Give resting cards a drop shadow |
| Use 12px buttons in the app | Square 2–4px buttons, or pills inside the app |
| Show time as pale-blue chips with blue figures | Plain grey timestamps in transcripts and comments |
| Treat thumbnails as content: the video leads each card | Crowd cards with buttons; actions live in the menu |
| Highlight the playing transcript line in pale blue with a blue edge | Bold or colour the whole line's text |
| Write warm, plain sentences that say what happened | Codes, blame or exclamation marks |
