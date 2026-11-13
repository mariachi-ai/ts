# Terracotta: the brief

Warm and image-forward: ink on white, one coral-to-magenta action, rounded photos without frames, hairline sections. Read this first; the depth is in [DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the fingerprint (`fingerprint.json`); `observed` = measured or seen on the source, `inferred` = a reading of it.

## Signature moves

1. **The photo leads.** Most screens open on a picture: a grid of photo cards, a mosaic, a photo beside the title. Photo cards have 20px corners and no frame. `observed`: media in 69% of the source's first windows, about 40% of the window on a place page.
2. **One gradient action per view**, full width, in the one lifted panel, under the figure it commits to. `observed`.
3. **The pill search with a coral disc**, the only coral in the header. `observed`.
4. **Selection is ink**: a 2px ink edge, an ink bar, an ink disc. Coral never means chosen. `observed`.
5. **Hairlines, not boxes**: sections open with a full-width hairline and 40–48px of space. `observed`: 95% of the source's collections are separated by space alone.

## Refusals

No frame or shadow on photo cards · no second gradient action · no coral for links, focus, selection or errors · no box around a page section · no coloured header · no spinner over a page. Evidence in [never.md](./never.md).

## The five habits that matter most

1. **Three weights, five or six sizes.** 400 body, 500 titles and labels, 600 section headings and prices. `observed`: 3 weights on every source screen; the language uses 3 [3,3] and 5 sizes [4,6].
2. **Lift by job.** Commit panel: hairline + soft shadow. Floating cards and the search pill: shadow only. Information panels: hairline only. `observed`: source panels are 73% shadow-only, 22% hairline-only, 6% both; the language 75%, 13%, 12%.
3. **Flat structure.** Panels nest one level, two at most. `observed`: depth 1 [1,2] on both.
4. **Underlined ink for every quiet action**: Send, Save, Edit, Read more, price lines. `observed`.
5. **Ink sentences, grey details.** Running text is ink; grey is for the short lines under a card title, hints and values. `inferred` from the source's place and help pages.

## Start from

Browse → `list-detail` (results). One thing → `list-detail` (listing). A flow → `onboarding`. Settings → `settings`. Daily tool → `dashboard`. See [precedents/index.md](./precedents/index.md).
