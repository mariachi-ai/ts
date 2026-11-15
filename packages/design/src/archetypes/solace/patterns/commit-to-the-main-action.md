# Commit to the main action

**The job:** take the one step forward on a screen (begin, continue, start a trial, switch plan) without having to look for it.

## What Solace does

1. **One blue action per view.** The action blue (`accent.default`) fills one bold pill with white text and the 2px press-shadow. 48px by default, 56px (`lg`) for the step at the foot of a flow.
2. **It sits where the eye lands next:** under the heading and its one line on a public page or a band; inside the featured card on the dashboard; at the right of the membership panel in settings; full width at the foot of a flow or a sheet.
3. **The rest are quieter:** the warm off-white pill (the default secondary), a ghost pill ("Skip for now"), a white pill when the ground is already warm off-white, or blue link text.
4. **On public pages the header carries it:** "Log in" as a ghost and the blue pill at the right of the site header ("Try it free"). The page's opening may end in a second blue pill (often the same offer again); that is the most a public first window holds.

## Where it appears

- `dashboard` (Begin, in the up-next card), `list-detail` (Begin course), `onboarding` (Continue), `settings` (Switch to yearly), `empty-state` (Browse the library), `pricing` (Start my free trial), `errors` (Continue; Back home, Try again, See plans), `reading` (the header's Try it free), `sign-in` (Continue).
- Source: a blue pill is in the first window of every studied public screen, at every width (`observed`: `emphasis.primaries` 1 to 2 on all 60 studied screen-widths, the action hue the same on all of them). At 1440 it is two on 11 of the 20 studied pages: the header's pill and the opening's own (the same offer on the home and product pages; the not-found page pairs the header's offer with its way home). That the app screens keep one is `inferred` from the public pages and the published app screenshots.

## Variations and triggers

- **Destructive:** the solid red pill replaces the blue only to confirm something that can't be undone (Delete my account, Sign out on the confirm sheet). It is still the only filled action in view.
- **Chosen among pills:** a chosen option (a guide, a plan period) is a charcoal pill (`bg.inverse`), never blue: blue means "go", not "selected".
- **Busy:** the pill keeps its width and swaps its label for the spinner (`aria-busy="true"`).
- **Two equal ways out** (an error page's Try again and Get help): blue first, warm off-white (or white on a warm band) second.

## What it does not do

- Never two blue actions in an app view, and never more than two in a public first window (the header's and the opening's). Anything else blue is a link or a checked choice.
- Never the orange for an action. Orange is the brand: the mark, a highlighted word, the play button, the streak dots and the current step.
- Never an outlined primary, a square primary or a light-weight label.
- Never a gradient or a tint of blue as a "softer" primary.

## Why

- `inferred`: the source asks for one next step at a time, the way its phone screens do, and the bright blue is kept for that step alone so it is always findable.
- `observed`: the action hue is identical on every studied screen; the orange never fills a button there except the round play button.
