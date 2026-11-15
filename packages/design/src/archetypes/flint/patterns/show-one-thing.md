# Show one thing

**The job:** show one task (the agent's thread and what it changed) or one page of docs, and what can
be done with it.

## What Flint does

- **A task:** the work area splits in two.
  1. The thread: a 40px title bar (the task's name, where it runs, quiet icon buttons), the person's
     message in a box a step up from the panel, then the agent's steps as quiet one-line rows ("Read",
     "Searched", "Thought 6s"), a boxed command with its status and time, the agent's answer as plain
     13px text, a files-changed box, then the composer pinned at the bottom.
  2. The change: file tabs, a breadcrumb, the diff count with Undo and an inverted Keep, then the diff
     in 12px mono with green and red line fills and a 2px bar in the gutter.
- **A docs page:** one article column at most 672px: a muted section name, a 36px regular title,
  14px text with a relaxed line height, code blocks on the darkest step, 22px regular section heads,
  Previous / Next over a hairline. "On this page" sits at the right, with "Copy as text" under it.

## Where it appears

- `list-detail` (the task), `reading` (the docs page).

## Variations and triggers

- **A narrow screen:** the diff drops under the thread; on docs the article comes first and the docs
  panel follows it.
- **A task still working:** the title bar's mark is the stroke ring; the composer still takes a
  follow-up.
- **A long thread:** older steps stay as one-line rows; only commands and files get boxes.

## What it does not do

- No avatar or bubble for the agent; its words are plain text on the panel.
- No box around every step; no coloured headers on the panes.
- No bold title: the task name is 13px in the bar, the docs title 36px at regular weight.
- No docs article wider than about 672px.

## Why

- `inferred`: the thing being judged is the change, so the thread stays quiet and the diff carries the
  colour. Observed on the source's public pages: a docs article column with a muted section name over a
  regular-weight title and "On this page" at the right; the thread's one-line steps and "Thought 6s" in
  the product frame its site draws in HTML.
