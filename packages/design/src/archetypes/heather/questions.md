# Questions

The ten questions whose answers would change Heather the most, about reasons and conflicts. Each says
what is known now and what would change.

1. **How big are icons in the app?** The source's public video page draws its player and header
   icons at 24px (icons.size 24 [18, 24] over its studied pages), and every held-out page flagged the
   language's 16–20px. The library and sidebar in public screenshots look nearer 16–20px. If the app
   is 24px throughout, the icon sizes in `index.ts` and the recipes change.
2. **Are the app's buttons 12px or 6px?** 12px is estimated from public screenshots of the library;
   the one design-system button measured on the live video page has 6px corners. Which is current?
3. **How large is an app page title?** 32px is estimated from screenshots; the video title is 24px,
   measured. If library and settings titles are 24px too, the app's heading ratio becomes one value.
4. **What do the product's own sign-in and sign-up look like?** The log-in page was held out unseen;
   the `sign-in` recipe (24px title, one card) is inferred from the system.
5. **Are there always two solid blues in the app?** The record button stays in the sidebar while a
   page adds its own primary ("New recording"). Is that intended, or does the page's primary step
   down to secondary when the record button is present?
6. **Which family does a public guide belong to?** The source has public video pages in the app's
   type (24px titles, 400/500/653) and community pages in the marketing site's (larger, 400/700).
   `reading` uses the app's three weights with 16px text. Which should a guide follow?
7. **Should public pages keep the site's own two weights and face?** The marketing site uses 400 and
   700 in a different typeface; the language keeps one type system (the app's three weights)
   everywhere. Is one system right?
8. **Do empty and error pages keep the app frame?** The source's not-found pages are public (site
   bar, an illustration, one way back). For signed-in people the recipes keep the sidebar and use an
   outline icon. Right?
9. **Should the phone get a bottom tab bar?** The native app has one with a central record button;
   the recipes put the page first and the sidebar below.
10. **Is the signed-in app's dark mode the same as the video page's?** Only the video page's own dark
    theme was seen.
