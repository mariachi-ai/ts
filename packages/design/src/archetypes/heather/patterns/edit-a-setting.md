# Edit a setting

**The job:** let someone see how the workspace is set up and change one thing, knowing when the
change takes effect.

## What Heather does

1. **The frame,** a muted workspace line over the 32px title, and underline tabs for the areas
   (General, Members, Branding, Privacy, Billing, Apps).
2. **Titled sections on hairlines:** each a 16px/653 title and one 14px subtle sentence saying what
   it controls, then its controls; 24px of space and a hairline between sections. No boxes.
3. **Text values** are an input with a secondary Save beside it.
4. **Choices** are radios with an outline icon before each label.
5. **Toggles** are switches at the right of a label and a 12px subtle hint; they apply at once and
   the section says so ("These take effect at once").
6. **Delete comes last,** in its own section, with a sentence saying exactly what goes, and a danger
   button ending in an ellipsis.

## Where it appears

- `settings`; the members table inside it follows [browse-many-things](./browse-many-things.md).

## Variations and triggers

- **A new option:** a small blue "New" badge after its label.
- **Narrow:** the tabs scroll sideways; input and Save wrap under the label.

## What it does not do

- No cards around sections, no second sidebar for settings.
- No Save for switches, and no page-wide Save button.
- No red anywhere but the delete section.

## Why

- `inferred`: each setting is small and independent; hairlines keep the page one calm column, and
  saying when a change applies replaces a global Save.
