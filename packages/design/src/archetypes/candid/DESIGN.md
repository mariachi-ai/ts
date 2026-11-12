# Candid

Category: social and messaging. A daily photo feed, black-first and stark: pure black, white type set
bold and tight, one dual-camera post per person (a big photo with a small inset in the corner), a grey
line under each name saying where and how late, round reactions stacked over the photo's edge, a bare
top bar with text tabs, dark grey pills for small actions and one white button for the action that
matters. The light theme inverts it: white, black type, a black button. For photo-sharing, friends and
community apps that should feel unpolished, immediate and honest.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `candid` preset of `@mariachi/design` (`data-theme="candid"`,
`themes/candid.css`). Dark is the language's home; set `data-mode="dark"` unless the person has asked
for light.

## Principles

- **The photo is the only colour.** Everything around it is black, white and three greys. No accent
  hue, no gradients in the chrome, no decoration. Red only counts notifications and marks errors;
  blue only marks a mention or a verified name.
- **Unpolished on purpose.** Minimal chrome: no panels around the feed, no shadows, no dividers
  where space will do. Type does the work: bold, tight and white.
- **One white button.** The action that matters is a solid white rounded rectangle with black text
  (black with white text in light). Everything else is a dark grey pill, a ghost icon or bold text
  with an arrow.
- **Say when.** Every post carries its moment: a place and "On time" or "4 min late" in grey under
  the name. Times are exact ("9:41:07am"), never rounded to "today".
- **Round for people, rounded for things.** Avatars, reactions, counts and chips are circles and
  pills; photos, cards and buttons have 12–16px corners.

## Foundations

| What | Dark (home) | Light (ours) |
| --- | --- | --- |
| Page | pure black `#000000` | white `#ffffff` |
| Panels, stats cards | `#121214` with a white-10% ring | white with a `#e5e5ea` ring |
| Pills, grouped lists, fields | `#1c1c1e` | `#f2f2f7` |
| Menus, dialogs | `#232325` | white |
| Hover and pressed fills | `#2c2c2e`, `#3a3a3c` | `#e5e5ea`, `#d1d1d6` |
| Text: default, muted, subtle | `#ffffff`, `#99999c`, `#8e8e93` (the late line) | `#000000`, `#5b5b60`, `#6c6c70` |
| Dividers | `#262628` (white about 10%); the feed's `#1a1a1c` | `#e5e5ea`; `#f2f2f7` |
| Control outline | `#6e6e73` | `#848488` |
| The action | white, black text | black, white text |
| Counts and errors | red `#ff453a`, black text | `#d70015`, white text |
| Mentions, verified | blue `#0a84ff` | `#0055ff` |
| Switch on | green `#30d158` | `#217e38` |

- **Radius.** 8px for small tiles and tooltips; 12px for buttons, the inset photo and menu rows;
  16px for photos, grouped cards, banners and toasts; 24px for public-page cards and dialogs. Fields
  are pill-ended. Avatars, reactions, chips, counts and small actions are fully round.
- **Shadow.** None in the feed. On black a faint white ring (`0 0 0 1px` white at 10%) stands in for
  a shadow; a profile photo card may carry a black drop with a soft white glow. Menus and dialogs
  take a ring and a long black shadow.
- **Motion.** 150, 200 and 350 ms on a plain ease. Pressed buttons drop to 80% opacity in the
  reference; here they step one grey darker. Nothing bounces or lifts.
- **Spacing.** A 4px unit. The usual gaps are:
  - 12px between the avatar and the name, and from the photo to the action row;
  - 16–24px between posts; a post is its own block, with no card or divider around it;
  - 16px inside grouped cards, 8px between a group's grey heading and its card, 24px between groups.
- **Layout.** The reference is a phone app; on the desktop it becomes:
  - a bare top bar in two rows: search at the left, the mark in the middle and the bell and your
    avatar at the right, then the text tabs centred below;
  - a centred feed column, about 30rem wide;
  - a nav panel (15rem) at the left and a side panel (19rem) at the right, both plain black;
  - forms, settings and sign-up as one centred column (26–37rem).
  On a phone the columns stack: today's photo and people to add on top, then the feed, then the
  nav.
- **Density.** 1 by default. For dense lists, set `--m-density: 0.85`.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact scales
are in the reference at the end.

## Type

- **Family.** Inter (variable) for everything, in place of the app's system font (SF Pro). Load
  `@fontsource-variable/inter`. Mono is Fragment Mono (`@fontsource/fragment-mono`), used only for
  codes.
- **Weights.** 400 for text; 600 for names, buttons, tabs and group headings; 700 for titles.
- **Sizes:**
  - body, captions and comments 15px; names 15px at 600;
  - the late line, hints and group headings 13px in grey;
  - tabs and nav rows 17px at 600;
  - section titles 17–20px at 700; page titles 28px at 700;
  - a person's name on their page 42px at 700; public-page headlines 58px at 700.
- **Tight.** Titles are bold with tracking pulled in (−0.02em; −0.03em for the largest) and line
  height near 1.05. Body text is untracked.
- **Case.** Sentence case everywhere. Usernames are lowercase as typed (`mara.quint`); only the
  small label chip ("MOST PICKED") is uppercase.
- **Figures.** Times to the second for a post ("9:41:07am"), short relative times for comments ("5
  min ago"), plain counts in pills ("12").

## Icons

- Lucide, outlined, **2px stroke**, round caps. 22px in the top bar, nav and settings rows; 18px in
  buttons and pills; 16px beside small text. The reference's own symbols are bold and some are
  filled: fill the closed shapes (send, comment, bell) with `currentColor` where they stand alone in
  a pill.
- Icons are white (black in light); grey only beside grey text. Never colour an icon for decoration.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `sliders-horizontal`;
  - more `ellipsis` (horizontal, at the right of a post), close `x`;
  - back `chevron-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `arrow-up-right` (after bold link
    text);
  - send `send`, refresh `refresh-cw`;
  - user `circle-user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- The product has no charts. When one is needed (a year of posts, reactions over a week), one series
  is white (black in light) as a 2px line or rounded bars on black, with no gridlines and grey 13px
  labels.
- More series step through blue, green, red, yellow and grey, the system hues the app already uses.

## States (every control)

- **Hover.** Ghost buttons, rows and menu items take a dark grey (`#1c1c1e`, menus `#2c2c2e`). The
  white button greys a step (`#e5e5ea`); dark grey pills lighten a step (`#2c2c2e`).
- **Focus.** A 2px white ring (black in light), 2px outside the control, on keyboard focus only. Fields
  turn their outline white while typing.
- **Pressed.** One more step (`#d1d1d6` on white, `#3a3a3c` on grey).
- **Disabled.** Half opacity; say why nearby.
- **Error.** The field's outline turns red and a red line replaces the hint; the form gets a red-tint
  banner. A post that failed shows a red alert icon on the dimmed photo with "Try again".
- **Loading.** A button keeps its size and shows a small spinner (`aria-busy="true"`). The feed shows
  round avatar skeletons and 3:4 photo blocks in `#1c1c1e`.
- **Selected and current.** The current tab is white, the others grey, with no underline. The current
  nav row is a dark grey pill with white 600 text. Checked boxes and radios are white with a black
  mark; switches turn green.

## Components

All 36 of the library's components, as Candid draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- a flex row that wraps for the three columns (nav, feed, side panel), centred;
- `m-container`, for sign-up (26rem), settings (37rem) and public pages (75rem);
- `m-split`, for a list beside a detail inside the feed area;
- `m-grid`, for photo tiles (8px gaps) and plan cards (24px gaps);
- `m-stack` and `m-cluster`, for everything inside.

**Actions and forms**
- **Button.** Weight 600, 12px corners, 40px by default.
  - **Primary:** solid white with black text (black with white in light), one per view: "Take
    today's photo", "Continue", "Message". The full-width sign-up button is `lg` (52px) with 16px
    corners.
  - **Secondary** (the default): a dark grey fill (`#1c1c1e`), white text, no border. Small actions
    beside a post (send, the comment count, "See all") are secondary **pills**: set
    `--m-button-radius: 9999px`.
  - **Ghost:** no fill; icons in the top bar and on posts (more, close).
  - **Danger:** solid red with black text in dark, white in light; only to confirm a deletion.
  - **Icon-only:** a round ghost or secondary pill, 40px, with an `aria-label`.
- **Input, textarea.** Filled `#1c1c1e`, pill-ended (24px corners), with the passing grey outline
  that turns white while typing. Search has a leading icon. Sign-up uses a large centred field with
  the text in bold.
- **Select.** The same filled pill, with a chevron.
- **Field.** The label above in 15px white, the control, then the hint in grey 13px, or the error in
  red. Fields stack 20px apart.
- **Checkbox, radio.** Both round, 20px, a 2px grey ring; checked is a white disc with a black tick or
  dot.
- **Switch.** The system switch, 51 by 31px: green with a black thumb when on in dark (white in
  light), grey when off.

**Navigation**
- **Navbar** (public pages). Black, 64px, the mark at the left, grey 17px links that turn white, a
  plain "Log in" link and a white pill ("Get the app") at the right. No border.
- **Top bar** (in the app). Not a component: two rows on black. Search at the left, the mark centred,
  the bell (with a red count) and your avatar at the right; the text tabs centred below. It stays on
  top while the feed scrolls.
- **Tabs.** Text tabs: 17px at 600, grey, the current one white, 24px apart, no underline and no
  border. The pill variant is a row of dark grey chips, the current one lighter.
- **Sidebar.** The desktop nav panel: black with no edge, 22px icons and 17px rows in grey, the
  current row white on a dark grey pill, counts as small red pills. A grey heading ("Your groups")
  above round initials.
- **Breadcrumb.** Rarely used; grey links with "/" between, the current one white at 600. Prefer a
  back chevron in the top bar.
- **Pagination.** Round grey numbers; the current one a white disc with black figures. The feed
  prefers endless scroll.

**Data and content**
- **Table.** Lists, not grids: no frame, no header fill, grey 13px headers at 600, faint hairlines,
  a near-black hover.
- **Card.** `#121214` with a white-10% ring and 16px corners, no shadow; the title bold. The sunken
  card is the grouped list (`#1c1c1e`, no ring); the outline card is transparent with the ring.
  Public-page cards take 24px corners; the picked plan is ringed in white.
- **Badge.** A 22px pill at 12px weight 600: dark grey for labels; the solid badge is the white label
  chip with black uppercase text and 4px corners.
- **Avatar.** Round; initials in white 600 on `#2c2c2e`. 32px in rows and the top bar, 40px on posts,
  72px on a profile card. Stacked reactions use `m-avatar-group` at 68px with a 3px black ring and
  14px overlap, a small white disc with a black glyph on each, and a black "5+" circle last.
- **Divider.** The feed's faint hairline (`#1a1a1c`). "View all 12 comments" sits centred between two
  hairlines.
- **Accordion.** A grouped dark grey card with 16px corners, 15px questions at 600, a chevron, grey
  answers.
- **Code, kbd.** Fragment Mono on `#1c1c1e`, 12px corners; keys are small rounded boxes with a hairline.
- **Prose.** 15px, line height 1.5, at most 62ch; links white and underlined.
- **Progress.** A thin white bar on dark grey: the sign-up steps are four of them side by side.
- **Meter.** The same bar; red past the high mark.
- **Usage.** A label and amount over the thin white bar (storage for saved photos).

**Feedback and overlays**
- **Alert.** A tinted card with 16px corners, no border and no stripe, a 20px icon, a bold title and
  one line.
- **Toast.** A dark grey (`#232325`) card with 16px corners and white text at the bottom, one ghost
  action.
- **Dialog.** `#232325` with 24px corners, a white ring, black at 70% behind. A 20px bold title, grey
  body, the white button last.
- **Popover and menu.** `#232325`, 16px corners, 44px rows at 15px with 10px corners that take
  `#2c2c2e` on hover; a destructive row in red at the bottom.
- **Tooltip.** A white chip with black 13px text at 600, 8px corners.
- **Spinner.** A 3px white ring.
- **Skeleton.** Round avatar blocks, text bars and 3:4 photo blocks in `#1c1c1e`.

**AI and chat**
- **Chat.** Messages between people: yours white with black text on the right, theirs dark grey on
  the left, 18px corners, at most 72% wide, the time small and grey under a run.
- **Composer.** The comment field: a filled pill (24px corners) with the passing outline and a round
  white send button at the right.
- **Thinking.** A grey "typing…" line or three soft dots in a grey bubble.
- **Tool call.** A dark grey row with 12px corners, the name in 600 and a status badge.
- **Citation.** A small round grey pill with a number; the source in a popover.
- **Usage**, as above.

**The post** (built from the parts above; it is the language's signature):
- the header: a 40px avatar, the username at 600 and a grey 13px line ("Lisbon · 4 min late" or
  "On time"), a ghost "more" at the right; an optional grey context line above it with a close;
- the photo: 3:4, 16px corners, full column width; the inset photo at its top left, 28% wide, 12px
  corners and a 2px edge in the page colour;
- reactions stacked over the photo's bottom-right edge, overlapping it by half;
- the action row: a send pill and a comment pill with its count;
- the caption at 15px, two comments (name at 600 in a fixed column, then the text), and "View all
  N comments" between hairlines.
Photos are always token shapes or the person's own images; never stock faces.

## Error handling

- **In a field:** the outline turns red and the message replaces the hint. Validate on blur and on
  submit, never while someone is typing.
- **In a form:** a red-tint banner at the top says what wasn't done and how many things to fix; each
  field shows its own message.
- **A photo that didn't post:** the photo stays in place, dimmed, with a red alert icon, "Couldn't
  post your photo", "It's still on this device" and a white "Try again". Never drop it.
- **Offline:** a yellow-tint banner says the photo will post when the connection is back, with a
  retry.
- **Somewhere else:** a dark grey toast with what happened and one action.
- **A whole page:** centred on black inside a ringed card: a round grey disc with an icon, the code in
  small mono, a bold 28px line, one sentence and either a bold link with an arrow or the white button.
  - **404:** "Nothing here", with "Back to the feed ↗".
  - **500:** "Something broke on our side" and "Your photos are safe", with Try again.
  - **403:** "This group is private", with Ask to join.
- **Words.** Say what happened, whether anything was lost, and what to do. No codes in sentences, no
  blame, no exclamation marks.

## Page shapes (recipes)

- **Dashboard (the feed).** The bare two-row top bar with Today, Groups and Campus; the nav panel; the
  centred feed of posts (header, dual photo with stacked reactions, pills, caption, comments, "View
  all"); the side panel with your photo today (posted time to the second and "On time"), people to
  add with white Add pills, and grey footer links.
- **List and detail.** People: a search field, requests with a white Accept pill and a close, your
  people as rows with chevrons (the current one on dark grey); one person's page with their name in
  42px bold over the photo on a gradient to black, a grey place, a figures line, a white Message
  button beside dark grey ones, then recent photos in a 3:4 grid with bold dates.
- **Onboarding.** One question at a time: a back chevron and the mark, four thin progress bars, a
  28px bold question, a large centred field, a grouped-card preview of how you'll appear, and the
  full-width white button at the bottom with a log-in line.
- **Settings.** A back chevron and a centred bold title; a profile card; grouped dark grey cards with
  grey headings: icon rows with chevrons and grey values, switch rows with a hint; a red "Log out" in
  its own card; the version and "Delete account" in grey.
- **Empty state.** Before you post: a friend's photo blurred under a dark veil with an eye-off icon,
  "Hidden until you post", one line and the white button; then the end of the feed: a round grey
  icon, a bold line, one sentence, the white button and a dark grey pill.
- **Pricing.** The public site on black: the navbar with a white pill, a huge tight headline, three
  plan cards (the picked one ringed in white with a white label chip and white button), a ringed panel
  of three big figures split by hairlines, questions in a grouped card, and a bold arrow link.
- **Errors.** A form with a red banner and field errors, the offline banner, a photo that didn't post,
  a toast, and the 404, 500 and 403 pages above.

## Words

- Short, plain and a little dry; sentence case: "Take today's photo", "People to add", "Hidden until
  you post".
- Say the moment exactly: "Posted 9:41:07am", "4 min late", "On time".

## Do and don't

| Do | Don't |
| --- | --- |
| Keep the page pure black (white in light) | Tint the background or add gradients to the chrome |
| Use one white button per view | Make several white buttons compete, or colour a button |
| Make small actions dark grey pills | Outline buttons or add borders to pills |
| Put the inset photo at the top left with an edge in the page colour | Float the inset outside the photo |
| Stack reactions over the photo's bottom-right edge | Put reactions in a row under the caption |
| Say how late, in grey under the name | Hide the time, or round it to "today" |
| Set titles bold and tight | Use light or wide-tracked titles |
| Use red only for counts and errors, blue only for mentions | Add a brand accent colour |
| Draw photos as token shapes in examples | Use stock photos or faces |
