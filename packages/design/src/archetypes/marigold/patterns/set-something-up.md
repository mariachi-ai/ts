# Set something up

**The job:** let someone change how the product works for them (sounds, reminders, their name) and
find the other settings pages.

## What Marigold does, in order

1. **A heavy page title with the save button on the same line,** at the right, small and green.
2. **Groups under grey uppercase labels** (15px at 800, tracked), in a 38rem column.
3. **Switches as rows:** the setting's name at 800 and a muted one-line hint on the left, the switch
   on the right, each row on a 2px line. Switches apply at once.
4. **Text settings as fields:** the label above (17px at 800), the input in the pale well with a 2px
   border and 12px corners, a muted hint under it. Fields stack 16px apart.
5. **A last group for leaving:** under a 2px line and its own uppercase label, a white button and a
   red danger button side by side ("Export my data", "Delete account").
6. **The settings menu as outlined cards in the right column:** a 24px heavy "Settings" title, then
   the pages as uppercase items; the current page in the sky tint with a blue outline. A second card
   holds the links that leave settings (membership, help).

## Where it appears

- Recipe: `settings`.

## Variations and triggers

- **A screen of only switches** has no save button (switches apply at once).
- **On phones** the menu card moves above the form.

## What it does not do

- It doesn't put settings in tabs across the top or in a modal.
- It doesn't draw each group as a card; groups are separated by space and their uppercase labels.
- It doesn't confirm a switch with a toast.
- It doesn't use the green for the danger group or the red for anything else.

## Why

- `inferred`: the same right-column-of-cards shell as the rest of the app keeps settings from feeling
  like a different product.
- Note: no settings screen of the source was seen in public; this shape is assembled from the
  source's form, card and shell rules (see questions.md).
