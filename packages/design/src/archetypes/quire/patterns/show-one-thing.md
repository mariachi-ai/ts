# Show one thing

**The job:** show one page (a draft, a guide, a published page) so it can be read and changed in place.

## What Quire does

1. **A white sheet** with 16px corners on the page shadow, 48.5rem (776px) wide at most, over the grey window or a soft colour cover; 24–40px of padding above, up to 48px either side.
2. **The top:** a breadcrumb in muted 12px with "›" and small capsules (Share, Style) at the right; or nothing, on a published page.
3. **The title** at 24px bold (tracking −1.2%), then a faint rule under it (`#f1f1f2`), then a muted 13px byline where there is one (a mention, the word count, when it was edited).
4. **Blocks in order:** body text at 16px on a 24px line; section headings at 19px semibold (a part) or 17px semibold (inside a part), with a 3px ink focus bar where a heading leads a quote; toggle blocks, key-value tables and tinted blocks (see [set-a-block-apart](./set-a-block-apart.md)); a 2px dotted rule between sections; page cards and page links at the end.
5. **A long page splits into sheets,** one per part, 32px apart, each with its own 19px heading.

## Where it appears

- `list-detail` (the draft under the table), `reading` (a published page in two sheets), `onboarding` and `sign-in` (one sheet as a form), `errors` (whole-page errors as sheets).

## Variations and triggers

- **In the app** the sheet sits on the grey window under the toolbar.
- **Published** it sits on a soft colour cover, with the page's contents in the sidebar; on a phone the sheet comes first, nearly full width, and the contents follow.

## What it does not do

- Never document text at interface size: the page is 16/24, the chrome 13.
- Never a border round the sheet; never a second sheet style.
- Never a bold heading above 24px inside the app; the serif is for the public pages and the serif page style.

## Why

- `observed`: the source's shared documents set the title at 24px bold over a faint rule, body 16px, subtitles 19px and headings 17px, both semibold, on white sheets with 16px corners over a backdrop, one sheet per part (inventory ids in the private notes).
- `inferred`: the app's own pages use the same sheet, from the app screenshots in the private notes.
