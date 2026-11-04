---
"@mariachi/design": patch
---

The `enterprise` and `terminal` presets list `"Liberation Mono"` before the generic `monospace`, as the base stack does. On Linux without their named fonts, the generic family resolved to whatever fontconfig ranked first (often a CJK font), and Chromium could switch fonts mid-page.
