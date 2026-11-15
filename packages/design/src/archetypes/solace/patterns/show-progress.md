# Show progress

**The job:** show how far someone has come: through a day, a week, a course or a flow.

## What Solace does

- **The day as a timeline:** a soft 2px vertical rule with a marker beside each session card: a green circle with a white tick (done), a solid orange dot (up next), an empty ring (later).
- **The streak:** seven 32px circles for the week, orange with a tick for each day with a session, an orange ring for today, warm off-white for days to come; the count beside a flame ("9 days").
- **Stat tiles:** a muted 14px label over a 24px bold number on the warm off-white, 12px corners.
- **A flow:** "2 of 4" in 14px muted between back and close, and a thin rounded bar in the deep orange under it.
- **A course:** session rows with a state circle (green tick, orange play, grey lock) and a badge ("Done" in the green tint, "Up next" in solid charcoal).
- **A trial:** a timeline of orange circles with icons, joined by a pale orange line, each with an 18px bold "when" and a muted line.

## Where it appears

- `dashboard` (timeline, streak, stat tiles), `onboarding` (step count and bar), `list-detail` (session rows), `pricing` (the trial timeline).
- Source: `observed` in the published app screenshots (the day's timeline with a dotted line, an orange dot and empty rings) and on the public plans page; the streak card is `inferred` (described in the source's help pages, which were blocked, and not seen clearly).

## Variations and triggers

- **Loading:** warm off-white skeleton blocks at the size of what is coming, with 8px and 16px corners; a spinner only inside a button.

## What it does not do

- No percentages or charts for a person's own practice; counts and dots.
- No red for a missed day: it is simply not filled.
- Never blue for progress; blue is the action.

## Why

- `inferred`: progress is meant to encourage, not to grade, so it counts what was done and never marks what wasn't.
