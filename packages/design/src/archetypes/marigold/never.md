# Marigold: never

What this language refuses to do, each with its evidence. "Source" means the public screens of the
product the language was measured from (17 studied screens at three widths, plus public screenshots
of its app, kept in the private notes); "recipes" means Marigold's nine page shapes.

1. **Never a blurred drop shadow for depth.** Depth is a solid lip under a shape, nothing else.
   - `observed`: the probe found no shadowed container on any source screen (shadow share 0 on 51 of
     51 screen-widths); every edge it saw was a border only (11 of 11). The source's tiles draw their
     lip as a thicker bottom border (28 of 28 tiles in the window).
   - Recipes: no soft shadow on any card or row. **Exception, kept:** overlays (toast, dialog, popover)
     add a faint drop under their lip (`--m-shadow-overlay`); the source's overlays weren't seen in
     public, so this is the language's own choice.
2. **Never a line thinner than 2px.** Outlines, dividers, row lines and the side column's edge are all
   2px; lips are 4px.
   - `observed`: the source's FAQ rows are split by 2px lines (8 of 8 in the window) and its outlined
     group and tiles have 2px sides (`help`, `courses`, `register` in the private inventory).
   - Recipes: every border uses `--m-border-width-thin` (2px) or `-thick` (4px).
3. **Never a third font weight.** 500 and 800 only.
   - `observed`: one or two weights on every source screen (51 of 51).
   - Recipes: 1 to 2 on every screen-width (21 of 21) after this pass; the preset maps medium to 500
     and semibold to 800 so a component can't add a third.
4. **Never green for "chosen".** Green is the action, progress and "right"; whatever is picked or
   current is the sky tint, a light-blue outline and blue text, all three together.
   - `observed` in public screenshots of the source's app (the current tab, a picked answer).
   - Recipes: `onboarding` (the picked tile), `dashboard` and `list-detail` (the current nav item, the
     selected segment), `settings` (the current page in the menu).
5. **Never a picture of the language's own, and never a picture outside its four slots.** Marigold
   ships no pictures, illustrations or characters. App screens mark big moments with a large icon in
   a pale tinted circle. A product's **own** pictures (its screenshots, its illustrations, a person's
   photo) go only in the public pages' four picture slots: the reading lead picture, screenshots in
   a post, picture links, and a landing feature row (DESIGN.md, Page shapes, Pictures). An empty slot
   draws the tinted stand-in.
   - `told`: the design-language playbook (never copy images or illustrations). **Not** the source's
     habit: the source leads with a picture on many screens (`media.role` is `leads` or `inset` on 27
     of 51 source screen-widths, `none` on 16), nearly all of them public pages.
   - Recipes: no picture on any app recipe; `reading` draws the stand-ins in its three slots.
6. **Never a scolding error.** No blame, no codes in sentences, no exclamation marks on errors, and no
   red for a missed day or goal.
   - `inferred` from the source's error and answer screens (a plain correction and one button).
   - Recipes: `errors` (every message says what's safe and what to do), `dashboard` (goals show
     counts, never misses).
7. **Never a table for people or progress.** Rankings are open rows; progress is bars, counts and
   tiles; there are no column headers, sorting or pagination in the app's screens.
   - `observed` in public screenshots of the source's app (the weekly ranking, the goals list).
   - Recipes: `list-detail`, `dashboard`.
8. **Never a dark screen in the core brand.** White screens in light mode; dark backgrounds belong to
   dark mode only.
   - `observed`: the studied source screens are white except the paid sub-brand's two (`super`,
     `family-invalid` in the private inventory, 2 of 17).
   - Recipes: every recipe is white in light mode, including `pricing` (see questions.md, 7).
9. **Never the bright brand green as text.** `#58cc02` on white is 2.1:1, under even the 3:1 that
   large text needs; the lip green `#58a700` is 3.0:1, too close to rely on. Green words use the text
   green, `--m-color-success-fg` (`#3b7700`, 5.5:1 on white; `#93d333` in dark). A wordmark set as
   text is green words too; only a product's own logo image keeps its own colours.
   - `observed`: the source sets its public headlines in its bright green (the front page's section
     headlines, the blog's post headline). Marigold departs from the source here for contrast.
   - Recipes: `pricing` and `reading` (the display headlines); the brand green stays on fills (the
     unit banner, the primary button). Every wordmark in the recipes is in the text green.
