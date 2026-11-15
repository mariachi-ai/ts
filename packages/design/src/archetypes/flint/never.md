# Never

What Flint refuses to do. Each refusal carries how it is known: `observed` cites the source's public
screens (ids in the private notes) or a measured number, `inferred` is a reading of what was seen.
The recipes follow every one.

1. **Never an orange button or orange text on a button.** The orange is the mark, a tint behind a
   "Recommended" tag and, in light, the link and focus colour. `observed`: on the source's public pages
   the main action is a near-black pill and the second a light grey pill or an outline (home, pricing,
   docs, help); orange appears as links, the current docs page and the not-found page's links.
2. **Never a third text weight, never 600 or 700.** 400 and 500 only. `observed`: the source's public
   pages carry one or two weights (`type.weights` 2 [1, 2] over 75 screens), its titles at 400 at every
   size. Its docs bold words at 700; the language bolds at 500, its one emphasis weight (`inferred`).
3. **Never a bold or heavy title.** Page titles, display titles, plan names and prices are 400.
   `observed`: the docs title (34px), the pricing title (52px) and plan prices (36px) are regular.
4. **Never a shadow on something that sits on the page.** Boxes are a grey step and a hairline;
   shadows are for menus, toasts and dialogs. `inferred` from public screenshots of the app; the
   source's public cards are tinted fills with a faint edge (help, marketplace), observed.
5. **Never a coloured surface in dark.** The panels are neutral greys a step apart, no blue or warm
   cast. `observed` in the app's published default theme and public screenshots (private notes).
6. **Never a two-line row in a side panel or picker.** One line, 31px; the detail at the right.
   `observed`: rows measure about 30px on the source's public pages (`density.rowHeight` 30 [23, 45]).
   Settings rows and form fields, which carry a help line, are the exception.
7. **Never an avatar or a bubble for the agent.** Its words are plain text; only the person's
   message sits in a box. `observed` in the product frame the source's home page draws in HTML.
8. **Never an illustration, mascot or picture in an empty or error state.** A thin grey icon, a
   short heading, one line. `inferred`: the source's not-found pages carry a drawn number and plain
   text; the language uses no pictures at all.
9. **Never colour without a number or a word.** A diff is "+38 −6"; a check is a dot and "Passing".
   `observed` in the product frame (green and red counts beside files).
10. **Never a side panel on a marketing page, or a site bar inside the app.** `observed`: the source's
    marketing pages have only the site bar; its docs add their own panel; public screenshots of the app
    show no site bar.
