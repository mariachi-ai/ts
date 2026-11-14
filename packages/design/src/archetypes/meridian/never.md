# Never

What Meridian refuses to do. Each refusal carries how it is known: `observed` cites what was measured or
seen on the source's public pages and published design system (page ids in the private notes), `inferred`
is a reading of them, `told` is a rule someone set. The recipes follow every one. Numbers are from the
fingerprint (`fingerprint.json`, 27 screen-widths).

1. **Never a coloured primary.** The main action is grey-1000, the colour of the text (white in dark).
   `observed`: every public page measured, the log-in page and the design system's fieldset show one black
   button; the published button tokens make the primary grey-1000.
2. **Never colour without a word.** A state is a 10px dot beside its name; rows, cards and pages are never
   filled with a tone. Only warn and error log lines take a tint. `observed` (the published status dot);
   `inferred` for rows.
3. **Never blue on a button or for decoration.** Blue is links, focus, switches when on, and the usage
   gauge. `observed`: on the docs, design-system, log-in and error pages measured, blue is only links and
   focus; the marketing home page's colour is in its pictures, which the language doesn't copy.
4. **Never a pill in the app's own controls.** Product buttons, inputs, menu rows and tabs are rectangles
   with 6px corners; pills are badges, the framed view switch and marketing calls to action. `observed`:
   the published radii; the pricing page's plan buttons are the pills.
5. **Never a page title other than 32px in the app.** One 32px page title per screen, 2.3 times the 14px
   text; cards and sections take 16px (20px on settings cards and a run's id). type.headingRatio 2.29 [2.17, 3.33] over 27 screen-widths; only
   pricing (4.57) and the article (2.5) go above. `observed` on the recipes; the source's pages keep their
   title at least twice the text (2.86 [2, 4.16] over 66 screen-widths).
6. **Never a fourth weight.** 400, 500 and 600, on all 27 screen-widths (type.weights 3 [3, 3]); never 700.
   `observed`: the source's pages use three or fewer (3 [2, 3]).
7. **Never icons other than 16px in a window,** except 20px in an empty state's tile, 40px on a full-page
   error, and 14px inline in 13px text. icons.size 16 [16, 16]. `observed`: 16px on 57 of the 66 measured
   source screen-widths; the 9 others are the log-in page (20) and the two error pages (14, 6).
8. **Never heavy shadows or fills to separate areas.** A 1px hairline does it; shadows are 2–6% and vanish
   in dark. `observed`: the source draws edges as 1px rings (structure.separation counts them as shadows).
9. **Never mono for prose or labels;** always mono for ids, commits, endpoints, cron lines, request ids and
   logs. `observed` (the platform's own not-found page: its code and id; the published code and snippet components).
10. **Never a sidebar first on a phone.** The page comes first; the sidebar follows. `observed`: the docs
    and design-system sidebars fold away at phone width; `inferred` for the app.
