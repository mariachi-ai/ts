# Questions

The questions whose answers would change Meridian the most, about reasons and conflicts. Each says what
is known now and what would change.

1. **Does the dashboard's overview have a page title?** The recipe follows the first study's reading of
   the overview (the toolbar opens the page, no title). Every other app page has a 32px title. If the live
   overview has one, the dashboard gains it and the "one title per screen" habit holds everywhere.
2. **How does the app's sidebar behave on a phone?** The docs and design-system sidebars fold behind a
   menu; the recipes put the page first and the sidebar after it. The first study mentions a floating
   bottom bar on mobile that wasn't studied. If it exists, phone screens change shape.
3. **Are app page titles 32px or larger?** The design system's own pages use 40px titles over 14px text
   (2.86 times); the recipes use 32px (2.29). If the app uses 40px, every app page's ratio moves up.
4. **Do large buttons carry 16px labels in the app too?** The log-in page's 40px buttons are 16px, and the
   design system publishes a 16px button size; the recipes use it for the full-width first-use actions
   only. Should every 40px button take it?
5. **What does a first run look like?** `onboarding` follows the import-and-configure flow from the docs'
   screenshots; the sign-up page was held out unseen. Is there a welcome step before it?
6. **Hairlines as rings or borders?** The source draws its edges as 1px box-shadow rings; the language
   draws borders that look the same. Does anything depend on the difference (focus rings stacking,
   overlapping cards)?
7. **Is the dashed frame for empty lists right?** The source's public empty search uses a solid hairline
   frame; the dashed one comes from the first study's reading of the app. If the app uses solid, change it.
8. **Should the comparison table on pricing be framed?** The source's table component has no frame; the
   recipes frame every table (an inference from the dashboard's framed lists).
