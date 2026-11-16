# Edit a thing

**The job:** create or change one record without leaving the list.

## What Tally does

1. A dialog, 64rem wide, 16px corners, a hairline and the long drop over a pale blurred scrim.
2. The header: a breadcrumb title ("Links › orbt.co/spring-menu" at 14px/600), "Save as draft" and a close button.
3. The body splits 2 : 1. Left: fields 24px apart (destination, the short link as a domain select joined to a key input with shuffle and suggest buttons, tags, comments). Right: a `#fafafa` panel with 12px corners holding the QR code and the link preview, each titled at 14px/500 with an edit button.
4. The footer: `#fafafa`, a hairline above; feature buttons (UTM, Expiration, Targeting, Password, more) at the left; the primary with the enter key at the right.

## Where it appears

- `list-detail`. Source: `observed` in the repo's link-builder modal and its header, and the public "create new link" screenshot.

## Variations and triggers

- **A small confirm:** 28rem, a white head with a title, a grey body with one field, a full-width button.
- **On a phone:** a bottom sheet with a grab bar.

## What it does not do

- No full-page editor for a link; it stays a dialog over the list.
- No tabs inside the dialog; extra options open from the footer buttons.

## Why

- `inferred`: links are made many times a day; keeping the list behind the dialog keeps people in place.
