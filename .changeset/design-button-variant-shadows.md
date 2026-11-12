---
'@mariachi/design': minor
---

Per-variant button shadows: `components.button.<variant>.shadow`, `.hoverShadow` and
`.activeShadow` for primary, secondary, ghost and danger. Each defaults to the button-wide shadow
(ghost stays shadowless at rest, as before), so existing presets are unchanged. A preset can now give
one variant its own treatment, such as a raised "ledge" primary beside a flat secondary.
