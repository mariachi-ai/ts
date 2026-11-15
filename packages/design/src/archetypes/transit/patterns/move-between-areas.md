# Move between areas

**The job:** know where you are and go somewhere else.

## What Transit does

1. **In the app:** a white header: the 28px wordmark, service tabs (16px icon, 14px medium label, 60px tall) with a **4px black bar** under the current one on a 4px pale-grey baseline across the header; at the right Activity as a ghost pill, the bell, a 32px black avatar.
2. **Account pages:** a 15rem side list beside the content; rows 48px, 16px icons, the current row in a grey fill with a 4px black bar at its leading edge and medium weight.
3. **Public pages:** a 64px black bar: the wordmark, links as 36px pills (14px medium, white text), "Sign in" with a person icon and a white "Join" pill at the right.
4. **Help pages:** a white bar under the black one: "Help" in 20px medium, a hairline, the audiences as pills with the current one black.
5. Breadcrumbs only on public reading pages: 16px black underlined links with "›".

## Where it appears

- Every recipe: `dashboard`, `list-detail`, `settings`, `empty-state`, `errors` (app header); `pricing`, `reading`, `sign-in` (black bar); `list-detail`, `settings` (side list); `reading` (help bar, breadcrumb).
- Source: the black bar with pill links and the white Join pill, the help bar with a black current pill, and the underlined breadcrumbs are `observed` on its public pages; the booking header's 4px black tab bar on a grey baseline is `observed` on its web booking page; the side list's grey fill and black bar is `observed` on its store pages.

## Variations and triggers

- **A flow** (onboarding, sign-in) → the black bar with only the wordmark (and the flow's name at the right).
- **On a phone** → the header keeps the wordmark, tabs and avatar; the side list moves above the content.

## What it does not do

- No coloured header; no underline in any colour but black; no icons in the public bar except the person icon.
- No current state in the public bar other than a white pill.
- No sidebar on public pages.

## Why

- `observed`: the two headers differ on the source between the booking app (white, tabs) and the public site (black, pills).
