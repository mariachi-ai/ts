# Edit a setting

**The job:** let someone check a value about their company or account, and change one when they need to.

## What Halcyon does

1. **The settings frame:** the app's workspace header and top bar stay; the sidebar becomes a back link
   ("‹ Settings") and grouped pages under 12px/480 labels (Company, Payroll, Team, Security & controls).
2. **The page head:** a square company avatar and the 28px/380 name.
3. **One row per setting** on a hairline, about 20rem for the label column: the label at 400 and, when
   it needs one, a 13px muted line saying what it is for; the value at the right, with "Edit ›" in
   accent text under it when it can be changed.
4. **Destructive actions last,** under their own hairline and 15px title, with a sentence that states
   the effect in figures and a danger pill.

## Where it appears

- `settings`.

## Variations and triggers

- **Read-only values** (legal name, EIN) have no Edit.
- **A value with several entries** (trading names) lists them one under another, the default marked by a
  neutral badge.
- **A yes/no setting** is a switch that takes effect at once, with no Save.

## What it does not do

- No boxed forms or cards around groups of settings; rows on hairlines.
- No Save button for the page; each value is edited on its own.
- No tabs across the top of settings; more groups in the sidebar instead.

## Why

- `inferred`: most visits to settings are to read a value (an EIN, an address) for somewhere else;
  showing values as text with a small Edit keeps reading fast and changing deliberate.
