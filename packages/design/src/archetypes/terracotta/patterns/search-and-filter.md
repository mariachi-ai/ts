# Search and filter

**The job:** say where, when and who, then narrow the results.

## What Terracotta does

1. **The pill search bar:** a white pill with a hairline and the `md` shadow, three segments split by short hairlines, each a 12px/600 label over a grey 14px value ("Where / Search places"), and a round brand-coral disc with a white `search` icon at the end.
2. On results and detail screens it shrinks to a **compact pill** in the header: three ink labels at 14/500 split by hairlines and a small coral disc.
3. **Filter chips** under the header: 34px pills with a `#dddddd` edge and 12px text; `Filters` first with `sliders-horizontal`; a chosen chip takes an ink edge on the sunken fill.
4. A help or article area uses a single-field pill (one grey prompt and the disc), centred under a large question.

## Where it appears

- `list-detail` (compact pill and chips), `dashboard`, `settings`, `empty-state`, `errors` share the guest header. Source: observed on the browse screens (full pill), the place pages (compact pill) and the help home (single-field pill) (private notes).

## Variations and triggers

- **Full pill** on a home or browse screen with nothing chosen yet; **compact** once a search exists.
- **Phones:** the pill becomes one full-width rounded field with "Start your search"; chips scroll sideways.

## What it does not do

- No square search box, no search button with a word in it, no search in a sidebar.
- The disc is the only coral in the header; the chips and the current chip are never coral.
- No filter panel open on the page; `Filters` opens a dialog.

## Why

- `inferred`: three questions in one pill make the search feel like one sentence; the coral disc marks the one place to commit.
