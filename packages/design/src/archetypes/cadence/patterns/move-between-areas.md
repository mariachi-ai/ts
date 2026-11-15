# Move between areas

**The job:** get from one part of the product to another, and always know what is playing.

## What Cadence does (the app)

1. **A fixed frame the height of the window**, black. The page never scrolls; each panel scrolls inside itself.
2. **The top bar**, 64px: the mark, a round grey icon button (Discover), the round search field (48px, fully round, on the highlight grey, a 24px search icon), then on the right a white pill, ghost icon buttons and the avatar in a grey ring.
3. **The collection panel** on the left, about 21rem: near-black, 8px corners, 8px from its neighbours. A bold 16px heading with a grey "+ New" pill and a widen arrow; chips; a search icon and a ghost sort control; rows of 48px art (circles for people) with a 16px title and a 14px grey line. The open item takes the tint; the playing item's title is green with a speaker icon.
4. **The main view**, the same panel colour, filling the rest. It ends with its **foot**: four columns of links in 30px rows under bold 16px titles, a rule, the fine print.
5. **The now-playing bar**, 72px, pinned at the bottom of the window: the track on the left (56px art, 14px title, 12px performer, the saved tick), the transport in the middle (shuffle, previous, a white round pause, next, repeat; the white scrubber with 12px times), device controls and a white volume bar on the right.

## What Cadence does (public pages)

- **The site header**: black, 64px, the mark and name, bold 16px grey links (the current one white), "Create account" as a link on the right, then the green pill.
- **The site footer**: black, 64px above, the mark, four columns under 12px bold capitals in grey (tracked 0.08em), white 16px links in 40px rows, then a rule and the fine print.

## Where it appears

- The app: `dashboard`, `list-detail`, `settings`, `empty-state`. Public: `pricing`, `reading`. `onboarding`, `sign-in` and `errors` have neither.
- Source: observed: the fixed frame (the document is the window's height and the main view scrolls inside it), the top bar, the panels, the foot of the main view and the pinned bottom bar on every web player screen; the site header and footer on the plans, download and help screens (ids in the private notes). The now-playing bar's parts are from a published screenshot of the signed-in app.

## Variations and triggers

- **On a phone** the main view comes first and the collection drops below it (the phone app keeps the collection on a tab of its own); the now-playing bar keeps the track and lets the transport and device controls go.
- **A detail panel** (now playing) opens on the right of the main view at 20–26rem.
- **A help page** adds a breadcrumb of bold grey links with chevrons.

## What it does not do

- No page scroll in the app; nothing scrolls the top bar or the now-playing bar away.
- No borders between panels: the black frame's 8px gaps separate them.
- No breadcrumbs in the app; a round back chevron instead.
- No sidebar on public pages.

## Why

- `inferred`: listening goes on while someone browses, so the transport and the collection stay put and only the content moves.
