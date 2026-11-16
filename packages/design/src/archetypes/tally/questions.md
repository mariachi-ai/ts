# Questions

At most ten, about reasons and conflicts, ordered by how much the answer would change the library.

1. **Is there a dark app?** The source declares dark values for its semantic colours, but its app shell uses fixed light greys. The language's dark is derived from those declared values (black panel, `#171717` panels, `#404040` frame). Should dark follow a real dark app if one ships?
2. **System face or Inter?** The app's running text is the platform's UI face (no family is set on the page); the language uses Inter, the source's own declared default family. Which should a builder treat as the real one?
3. **Loose or compact link rows?** The rows can be separate cards (the public screenshots) or one joined group (the compact display). The language draws separate cards. Which is the default people see?
4. **How dark should control borders be?** The source's field borders are `#d4d4d4` and its switch's off track `#e5e5e5`, both under the 3:1 floor; the language darkens them to `#8c8c8c`. Is a lighter look important enough to keep?
5. **Status text colours:** the source's green, amber and red text on their own tints read under 4.5:1; the language takes one step darker. Acceptable?
6. **Settings: cards for everything?** Every studied setting is its own card with a footer. Are there pages of label-and-value rows instead?
7. **What do the domains and members pages look like signed in?** Only public screenshots and the repo were studied.
8. **Is the bottom-centre toast the only position?** The toaster is set once at the bottom centre; are there exceptions?
