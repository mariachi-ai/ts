---
'@mariachi/design': patch
---

A theme on the root element no longer redefines `1rem`. `[data-theme]` set the theme's body size on
the element, so on `<html>` every rem token scaled a second time (a 15px body made 36px buttons
33.75px). The root now keeps the browser's size and its `<body>` takes the theme's size.
