# Summit: the brief

Sporty and loud: warm near-black on a cool off-white, white 4px cards, one signature orange for routes, wins and where you are, a darker orange for every action, compact type in two weights, and rows of big figures with small units. Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`); `observed` = measured or seen on the source, `inferred` = a reading of it, `told` = the commission.

## Signature moves

1. **A row of figures:** big tabular figures, a 14px unit, a 12px grey label, hairlines between. Every session, week and route leads with one. `observed` (route pages, published screenshots).
2. **One orange button at the top right, one more at most:** the app bar's "Start free trial" or the public "Sign up free", then the page's single action. `observed`: 38% of the source's primary actions sit in the top-right cell.
3. **The orange line marks where you are:** under the current bar link, beside the current side item or segment, under the current tab. `observed`.
4. **Two weights, compact sizes:** 400 and 600, four or five sizes from 12 to 32px. `observed`.
5. **White 4px cards on the cool off-white**, 4px buttons and fields; 16px only on plan cards. `observed`.
6. **Token-drawn maps with an orange route** for every map and picture. `told`.

## Refusals

No third weight · no off-ramp size or more than five sizes · no headline beyond about twice the body · no third orange button in a window · no signature orange under text or as a fill · no second action hue (blue is focus only) · no pills or soft cards in the app · no switches or radio lists in settings · no photos, map tiles, logos or faces · no tinted block for the current bar link. Evidence in [never.md](./never.md).

## Two families

The **app** (dashboard, list and detail, settings, empty state, errors; onboarding with the wordmark alone) uses the 56px bar with search, four links, "Start free trial", the bell, the avatar and `circle-plus`. **Public pages** (pricing, reading, sign-in) use the same bar with four plain links, "Log in" white and "Sign up free" orange. Reading is white with no cards; pricing opens on a dark band; sign-in is one near-black panel over a drawn map. See DESIGN.md, Page shapes.

## The five habits that matter most

1. **One action hue, in the same place.** `observed`: action hue 299.3 on all 43 source screen-widths that have one; the language 299.8 on all 27 (the same hue, one step darker for contrast). Primary actions per first window: source [0, 2], the language [1, 2].
2. **Two weights.** `observed`: source `type.weights` typical 2, range [2, 3]; the language [2, 2].
3. **Few sizes.** `observed`: source `type.sizes` typical 4, range [2.9, 5]; the language [4, 5].
4. **Titles about twice the body.** `observed`: source `type.headingRatio` typical 2, range [1.7, 3.6] (the high end is headlines over photographs); the language [1.9, 2.3].
5. **4px corners on buttons and fields.** `observed`: source `shape.controlRadius` typical 4, range [0, 6.2] (0 where full-height bar links dominate); the language typical 4, range [0, 4].

## Start from

A feed → `dashboard`. One session or route → `list-detail`. A flow → `onboarding`. Settings → `settings`. Nothing here → `empty-state`. Plans → `pricing`. Errors → `errors`. An article → `reading`. Signing in → `sign-in`. See [precedents/index.md](./precedents/index.md).
