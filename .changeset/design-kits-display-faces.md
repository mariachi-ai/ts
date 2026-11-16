---
'@mariachi/design': minor
'@mariachi/motion': patch
---

Kits now ship each language's display face where an open font package exists, so headlines no longer fall back to system fonts. This covers brutalist (Archivo Black), fennel (Sofia Sans Condensed), hearth (Archivo, with italic and width), tinker (Jura), trellis (Red Hat Display), halcyon and obsidian ("Inter Display", from Inter's optical-size files) and doodle (Inter Tight). Each face ships with its licence. A face drawn at one weight covers every weight, so bold headings aren't synthesised. Kit headers and docs point at `mariachi design reference <name>`.
