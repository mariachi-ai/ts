# Hearth

Category: social. Dark-first community chat: layered near-black greys, one blue-violet accent,
rounded bold type, round avatars beside grouped messages, presence dots and role colours, and a
matching light theme. For apps where people gather in spaces, channels and conversations: chat,
communities, clubs, gaming groups and creators.

This file is the design language in words; follow it for anything visual. Beside it:
- **`gallery.html`** draws every foundation, every icon, every component and every state, in light
  and dark;
- **`recipes/`** holds the seven page shapes as HTML using only the library's classes;
- **the generated reference** at the end of this file gives every exact value.

The tokens are in the `hearth` preset of `@mariachi/design` (`data-theme="hearth"`,
`themes/hearth.css`). Dark is the home mode: design in dark first, then check light.

## Principles

- **Layers, not lines.** Depth comes from stacked greys. The space rail and the channel list are the
  darkest layer, the conversation sits one step up, cards and dialogs above that, menus above those.
  Hairlines are faint; edges come from the change of grey.
- **People are circles, things are rounded squares.** Avatars and presence dots are round. Spaces,
  app icons, upload tiles and empty-state icons are squares with 12px corners.
- **One accent, used for action and selection.** The blue-violet fills the primary button, the
  checked control, the selected toggle and the mention tint. Everything else is grey and white.
- **Colour means people.** Role colours tint names; presence is a dot (online, idle, busy,
  offline). Never use a role colour for anything that isn't a person or a role.
- **Lively, never loud.** Type is rounded and bold where it names things (people, channels, titles)
  and plain for what people say. The marketing face (wide, heavy italic capitals) stays on
  marketing pages, pricing and full-page errors.

## Foundations

| What | Light | Dark |
| --- | --- | --- |
| Rail and channel list (sunken) | `#f3f3f4` | `#121214` |
| Conversation (canvas) | `#fbfbfb` | `#1a1a1e` |
| Cards, dialogs, settings panels (surface) | `#ffffff` | `#242429` |
| Menus and popovers (raised) | `#ffffff` | `#28282d` |
| Text: default, muted, subtle | `#2e2e34`, `#595a63`, `#6c6d76` | `#efeff1`, `#abacb2`, `#96979e` |
| Channel names at rest | `#666770` | `#81828a` |
| Hairlines | the neutral at 28%: `#dfdfe1` | the neutral at 12%: `#29292d` |
| Neutral fills (secondary buttons, hover, selected rows) | `rgb(149 149 160)` at 12%, 16%, 24% | at 12%, 16%, 20% |
| Accent | `#5865f2`, hover `#4452bb`, pressed `#3a48a3`; accent text `#4a57d4` | the same; accent text `#798df9` |
| Mention and selection tint | the accent at 16% | the accent at 16% |
| Focus ring | `#408eec` | `#6aa8f4` |
| Online, idle, busy | green `#008545`, amber `#faaa00`, red `#d22d39` | the same |

- **Radius.** 4px for badges, code and menu rows; 8px for buttons, inputs, cards, list rows and
  notices; 12px for dialogs and for spaces in the rail; full circles for people. Marketing plan
  cards use large 36px corners.
- **Shadow.** Little in the app: a layer is a change of grey. Menus, tooltips, toasts and dialogs
  take `0 12px 24px rgb(0 0 0 / 0.24)` in dark (`0 12px 36px` at 12% in light) plus a hairline.
- **Motion.** 150ms ease-out for hover and press, 200ms for opening, 300ms for larger moves; a
  small overshoot on entrances. Nothing bounces on hover.
- **Spacing.** A 4px unit. The usual gaps are:
  - 2px between list rows, 4px inside a group of chips;
  - 8px between a control's parts and around rows;
  - 16px between message groups, fields and cards, and as card padding;
  - 24px inside dialogs and between settings sections.
- **Layout.**
  - A 72px rail of spaces, a 240px channel list, the conversation, and a 240px member list.
  - A slim 32px title strip on top; a 48px bar over each channel with a hairline under it.
  - The "you" panel floats at the foot of the rail and channel list.
  - Settings: a 280px grouped list beside a 740px column.
- **Density.** 1 by default. For compact lists set `--m-density: 0.85`; controls and padding shrink
  together.

Use tokens, never colour literals: `var(--m-color-accent-default)`, `var(--m-space-4)`. The exact
scales are in the reference at the end.

## Type

- **Families.** Figtree (variable) for everything in the app: rounded, compact and friendly at 400
  for messages and 500–700 for names, channels and titles. Archivo (variable, with its width axis)
  for the marketing face: weight 800, italic, stretched to about 112%, all capitals, line height 1.
- **Mono.** Source Code Pro for code blocks and inline code.
- **Sizes:**
  - messages and body 16px with a 22px line (1.375);
  - secondary text, buttons, table cells and menus 14px;
  - timestamps, badges and small labels 12px;
  - titles 20px and 24px at 600; profile names 20px at 700;
  - marketing headings 32px to 64px in the marketing face.
- **Case.** Sentence case in the app, including group headings ("Your profile", "Voice"). Capitals
  only for tag badges ("NEW", "OFFER") and the marketing face.
- **Names.** A person's name in a message is 16px at 500 in their role colour; the time beside it is
  12px subtle.

## Icons

- Lucide, outlined, **2px stroke**, rounded ends: 20px in the channel list, bars, composer and
  settings list; 16–18px in buttons and menus; 40px in empty states.
- Every channel row has its type icon: `#` for text, a speaker for voice, a megaphone for
  announcements, a picture for media.
- Icon buttons are ghost buttons: grey icons that brighten and gain a grey fill on hover.
- **The same icon for the same action, every time:**
  - add `plus`, edit `pencil`, delete `trash-2`;
  - settings `settings`, search `search`, filter `list-filter`;
  - more `ellipsis` (horizontal), close `x`;
  - back `arrow-left`, forward `chevron-right`, expand `chevron-down`;
  - download `download`, upload `upload`, copy `copy`, external `external-link`;
  - send `send-horizontal`, refresh `refresh-cw`;
  - user `user`, notifications `bell`, calendar `calendar`, help `circle-help`;
  - info `info`, success `circle-check`, warning `triangle-alert`, error `circle-alert`.

## Charts

- **One series:** the accent, as bars with 4px top corners or a 2px line.
- **More series** step through blue-violet, orange, purple, teal, green, magenta, yellow and red.
- Gridlines are hairlines; labels are 12px subtle. Tooltips use the tooltip treatment (the card
  surface with a hairline), not an inverted box.

## States (every control)

- **Hover.** Rows, icon buttons and ghost buttons take the neutral fill at 12–16% and their text
  turns to full strength. The primary darkens to `#4452bb`. Nothing moves.
- **Focus.** A 2px blue ring outside the control (`--m-color-border-focus`) on keyboard focus; an
  active text field is edged in the accent. Never remove either.
- **Pressed.** One step darker: the primary `#3a48a3`, neutral fills 20–24%.
- **Disabled.** Half opacity, no pointer events. Say why nearby when it isn't obvious.
- **Selected and current.** The current channel or settings row takes the stronger neutral fill
  and full-strength text. Toggles and pill tabs take the accent tint with accent text. An unread
  channel is bold at full strength with a small pip at the list's edge; the current space has a
  tall pip.
- **Error.** The field's edge turns red and the message sits under it in red 14px.
- **Loading.** A button keeps its size and shows a spinner (`aria-busy="true"`). Lists show
  skeleton rows of neutral fill: a circle and two bars.

## Components

All 36 of the library's components, as Hearth draws them. Every one is in `gallery.html`.

**Layout.** Pages use the layout primitives:
- `m-split` for the channel list or settings list beside the page (240px; 280px for settings);
- `m-container`, the content column: 75rem, 46.25rem for settings, 30rem for forms;
- `m-grid` for cards, 16px gaps;
- `m-stack` and `m-cluster` for everything inside.

**Actions and forms**
- **Button.** 8px corners, 14px at 500, 40px by default and 32px (`sm`) in bars and rows, with a
  faint 1px edge.
  - **Primary:** the accent with white text; one per view.
  - **Secondary** (the default): the neutral fill at 12%, white text in dark and near-black in
    light. "Edit" and "Add" beside values are secondary `sm`.
  - **Ghost:** no fill until hover; for icon buttons in bars and for Back and Cancel.
  - **Danger:** solid red for the destructive confirm. A softer destructive action is a secondary
    button with red text.
  - **Icon-only:** a square ghost button with an `aria-label`.
  - **On the brand colour** (marketing): the inverse button, white in dark.
- **Input, textarea.** 44px, 8px corners, a slightly darker well than the layer it sits on (black
  at 12% in dark, 2% in light), 16px text, a control-strength edge that turns accent when active.
- **Select.** The same box as an input with a chevron; `sm` selects in toolbars use 14px text.
- **Field.** The label above in 16px at 500, full strength; a red asterisk for required; help in
  14px subtle below; the error replaces the help in red.
- **Checkbox, radio.** 20px; the checkbox has 6px corners. A grey edge at rest, the accent with a
  white mark when checked.
- **Switch.** 40 × 24, a white knob; the accent track when on, a grey track when off. Takes effect at
  once.

**Navigation**
- **Sidebar.** The channel list and the settings list.
  - On the darkest layer, 240px, 8px padding, rows 2px apart.
  - Rows are 16px at 500 with a 20px icon and 8px corners; channel names rest at `#81828a` (dark),
    settings rows at the brighter muted grey.
  - The current row takes the stronger neutral fill and full-strength text.
  - Group headings are 14px at 500, sentence case, muted, with a small chevron on the right for
    collapsible categories.
  - Unread counts are red pills with white numbers; totals (member counts) are neutral pills.
- **Navbar** (public pages). On the brand colour: the wordmark on the left, five links centred in
  white 16px at 500, and the inverse button ("Open the app") on the right.
- **Top bar** (in the app). 48px over the channel: its icon and name at 600, a dot, the topic in
  14px muted, then ghost icon buttons and a small search field on the sunken grey.
- **Tabs.**
  - **Underline:** 16px at 500, muted; the current tab in accent text over a 2px accent line on a
    hairline.
  - **Pill:** for filters in a bar ("Online", "Everyone"); the current one takes the accent tint.
- **Breadcrumb.** Rare: a back link ("← Back to Lowlight Observers") is preferred. When used,
  muted links with a chevron between and the current page at full strength.
- **Pagination.** Lists prefer "Show more" in accent text or endless scroll; numbered pages are
  32px ghost squares with the current one on the stronger neutral fill.

**Data and content**
- **Table.** For admin lists (members, invites, audit trail).
  - Inside a hairline frame with 8px corners; no header fill.
  - Headers 14px at 500, subtle, sentence case. Cells 14px with muted secondary columns.
  - Rows separated by hairlines, a faint neutral fill on hover, the accent tint when selected.
  - People get a 32px avatar with presence, their name at 600 and handle in 12px under it.
  - Roles are chips: a coloured dot and the role name on the neutral fill.
- **Card.** The surface grey, 8px corners, a hairline, no shadow, 16px padding. A profile card has a
  brand banner on top and the avatar cut into it with a ring of the card's colour.
- **Badge.** 12px, 700, capitals, 4px corners:
  - neutral (the neutral fill), for "OFFER" and totals;
  - solid accent ("NEW");
  - tones for status; red solid for the new-messages marker.
- **Avatar.** Always round. Initials in white on the accent (or green, red, blue to tell people
  apart). 24px in lists, 32px in member lists and tables, 40px beside messages, 80px on profiles.
  Presence is a 12px dot at the lower right with a 3px ring of the background colour.
- **Divider.** A hairline. Date dividers centre the date in 12px subtle; the new-messages divider
  is a red line ending in a red "NEW" tag.
- **Accordion.** Rows with hairlines in an 8px frame, the question at 600, a chevron on the right.
- **Code, kbd.** Source Code Pro. Blocks on the sunken grey with a hairline and 8px corners; inline
  code on the neutral fill with 4px corners. Keys are small neutral chips.
- **Prose.** 16px with a 22px line. Links are blue (`#4d96ee` dark, `#006dd4` light); block quotes
  have a 4px grey bar.
- **Progress.** An 8px round bar: the accent on a neutral track.
- **Meter.** The same bar; red past the high mark.
- **Usage.** A label and amount over the same bar.

**Feedback and overlays**
- **Alert.** An inline notice: the tone at 8% behind, a 1px tone edge, 8px corners, 12px padding,
  a 16–18px tone icon, the title at 600. Danger notices above a form say what didn't happen ("You
  haven't joined yet").
- **Toast.** Small and quiet: the raised grey, a hairline, 8px corners, the deep shadow, 22rem
  wide; a tone icon before the title, one action ("Retry"), and a close button.
- **Dialog.** The surface grey, 12px corners, a hairline and the deep shadow over a 72% black scrim
  (52% in light). The title 24px at 600; widths 442, 602 and 800px. Actions sit at the bottom
  right, or in a footer band on the sunken grey: Cancel as ghost or secondary, the primary last.
- **Popover and menu.** The raised grey, 8px corners, a hairline and the deep shadow, 8px inside.
  Rows are 32px, 14px in muted text, 4px corners; on hover the neutral fill and full-strength
  text. Destructive rows are red, last, after a hairline.
- **Tooltip.** Not inverted: the card surface with a hairline and the deep shadow, 14px at 500,
  8px corners, 8 × 12px padding, at most 200px wide.
- **Spinner.** The accent, in buttons and small areas only.
- **Skeleton.** Neutral-fill circles and bars at text sizes, with a slow shimmer.

**AI and chat**
- **Chat.** The message list.
  - No bubbles. A group is a 40px round avatar, then the name in its role colour (16px, 500) and
    the time (12px subtle) on one line, then the lines of text (16px, 22px line) with no gap.
  - Groups are 16px apart; a reply from the same person within minutes joins the group.
  - Mentions are accent text on the accent tint with 4px corners. A message that mentions you gets
    the amber tint across the row and a 2px amber bar on the left.
  - Reactions are small rounded chips under the message; yours is tinted and edged in the accent.
  - Link previews are a surface card with a 4px coloured bar on the left.
- **Composer.** A rounded box (8px) one step lighter than the conversation, a 44–56px row: a round
  plus on the left, the text, then gift, picture, sticker and emoji icon buttons on the right. It is
  edged in the accent when active. The typing line sits under it in 12px muted.
- **Thinking.** A muted line ("Ines is typing…") with three pulsing dots.
- **Tool call.** A hairline row with a 16px icon, the name at 600 and a status badge.
- **Citation.** A small neutral chip with a number; the source opens in a popover.
- **Usage**, as above.

## Error handling

- **In a field:** the edge turns red and the message replaces the help under the field. Validate
  on blur and on submit.
- **In a form:** a danger notice above the form with the count and what didn't happen ("2 things
  to fix. You haven't joined yet."). Each field shows its own message.
- **Somewhere else:** a toast with a red icon, what failed and one action ("Message failed to send
  · Retry"). Success toasts close themselves after a few seconds.
- **A whole page:** in the marketing face, left-aligned in the content column.
  - The code small in mono and subtle ("Error 404"), the title in wide capitals in accent text, one
    sentence at 18px, and one or two buttons.
  - **404:** "Lost in the dark?" with Go to your spaces.
  - **500:** "Something broke on our side": nothing was lost, Try again, the status page.
  - **403:** "This space is invite-only": ask a host, or go back.
- **Words.** Friendly and plain. Say what happened, whether anything was lost, and what to do next.
  A little warmth is fine; blame and jargon are not.

## Page shapes (recipes)

- **Dashboard.** The app's home: the rail, the channel list with the "you" panel under it, the
  channel bar, the message list with a date divider, a new-messages divider, a link preview, a
  mention and reactions, the composer, and the member list grouped by role with counts and
  presence.
- **List and detail.** A space's members in settings: a title and one-line description, a search
  well, a sort select, a Roles filter and the primary "Invite people"; a framed table with avatars,
  dates, how they joined and role chips; "Show more". A row opens the profile card: banner, avatar
  with presence, name, handle, a short bio, member-since and roles, and Message.
- **Onboarding.** A centred 442px card on the brand colour: the step, a bold centred title, an
  upload circle, one field, template rows (a coloured rounded square, a label and a chevron), then a
  footer band with Back and the primary action.
- **Settings.** The profile and a search field over the grouped settings list; on the right, a
  title bar with close, underline tabs, a profile panel (banner, avatar, Edit profile, then
  label-and-value rows with secondary Edit buttons), a success notice, switch rows, and account
  removal last with a red-text secondary and a danger button.
- **Empty state.** The people page with pill tabs and an add button in the bar; an 80px rounded
  square with a 40px icon, a 20px title at 600, one sentence, a primary and a secondary button.
- **Pricing.** The marketing face: a brand band with a navbar and a huge italic capitals title, a
  monthly / yearly switch, two plan cards with 36px corners overlapping the band (the featured one
  edged in the accent, with an inverse button), a comparison table and questions.
- **Errors.** The field, form, toast and full-page errors above, as one page.

## Words

- Friendly, short and in sentence case: "Make your space yours", "Nobody's online right now",
  "Add people".
- Name things by what people do: spaces, channels, people, roles.
- Times are relative near now ("Today at 17:09", "2 years ago") and full further back.

## Do and don't

| Do | Don't |
| --- | --- |
| Build depth from stacked greys | Draw borders around every panel, or use heavy shadows in the app |
| Keep people round and things rounded-square | Square avatars, or round space icons |
| Use the accent for the action, the checked control and the selection | Spread the accent over decoration, headings or icons |
| Colour names by role and show presence as a dot | Colour message text, or show presence by name colour alone |
| Group messages under one avatar and name | Repeat the avatar and name on every line, or use chat bubbles |
| Keep the marketing face for marketing, pricing and full-page errors | Set app titles in wide italic capitals |
| Use the same icon for the same action | Mix icon sets or stroke weights |
