# Show an error

**The job:** say what went wrong, whether anything was lost, and what to do now.

## What Lagoon does

- **A message that didn't send:** it stays in the thread, a red circled mark beside the bubble (a button: try again) and "**Not sent.** Click the mark to try again." in 11px red under it. Never dropped.
- **Connection:** an orange-tint notice under the thread's top ("You're offline"); messages wait and send on reconnect.
- **Somewhere else:** a notification banner at the top right of the window: raised white, 20px corners, a long soft shadow, a semibold title, one grey line, one grey capsule action and a small close.
- **In a sheet or form:** a red-tint notice above the fields saying what wasn't done and how many things to fix; each field's edge turns red and its message replaces the hint in red 13px.
- **A whole page:** a white grouped card, centred: a large grey outline glyph, the code in small mono, a 20px bold title, one grey sentence, and one blue capsule (plus a grey one at most).

## Where it appears

- `errors` (all of them), `sign-in` (field rules).

## Variations and triggers

- **Not found** (404): "This chat isn't here", Back to chats.
- **Failure** (500): says the messages are safe, Try again.
- **No access** (403): Ask to join, and Go back.

## What it does not do

- No red fill for a page, a banner or a bubble; red is for the mark, the text and the tint.
- No codes inside sentences, no blame, no exclamation marks.
- No modal alert for a message that didn't send.

## Why

- `inferred`: the reference marks a failed message in place, beside the bubble, and keeps it; Lagoon gives every other error the same order (what happened, what is safe, what to do).
