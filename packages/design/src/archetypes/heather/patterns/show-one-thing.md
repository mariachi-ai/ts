# Show one thing

**The job:** show one video with everything that belongs to it (who made it, the conversation, the
transcript), so someone can watch, reply and move on.

## What Heather does

1. **A white top bar** with the wordmark at the left and, at the right, Share as the one primary,
   then ghost icon buttons (more, search, notifications) and the avatar.
2. **The title band:** the title at 24px/653, "author · date" in 14px subtle under it; at the right
   a bordered viewers chip (stacked avatars and "38 views" at 653) and ghost icon buttons to copy the
   link and download.
3. **The video** on the grey well with 24px around it, in a 16px hairline frame, a round blue play
   button in the middle and a 4px blue progress line along the bottom.
4. **The reaction bar** under it (a floating card of emoji buttons with the soft shadow) beside a
   secondary Comment button.
5. **Below:** the summary with time chips and the up-next list side by side, then the comments and
   the comment box.
6. **The 435px side panel** at the right: underline tabs (Comments, Transcript, Details) with a
   collapse button at the end, a ghost toolbar (Copy, Find, more), then the transcript lines.

## Where it appears

- `list-detail` (the video page); `reading` repeats the video-first order on the public site.

## Variations and triggers

- **Narrow or phone:** the video and the title band come first; the side panel drops below.
- **No transcript yet:** the panel says so in one line, and Comments is the current tab.
- **A public viewer:** the same page, with Log in and the site's one primary in the top bar.

## What it does not do

- No second primary on the page besides Share (and Post inside the comment box when typing).
- No tabs above the video; the tabs belong to the side panel.
- No timeline of thumbnails, no chapter strip on the video itself; chapters are rows.

## Why

- `inferred`: the video is the thing; everything else is either about a moment in it (comments,
  transcript) or about who sees it (Share), so those are the only two places with weight.
