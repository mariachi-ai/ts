# Commit to the main action

**The job:** make the one thing to do next obvious.

## What Summit does

- **One orange button per view, plus the bar's.** The action orange (`color.accent.default`) with white 14px text at 600, 4px corners; full width in a narrow form or a plan card, content width elsewhere.
- **In the app bar**, "Start free trial" is always there at the top right; the page adds at most one more (Continue, Plan a route, Save, Upgrade, Log in).
- **Secondary actions are white** with a hairline; tertiary ones are orange text.
- **Flows keep the action in view:** onboarding holds Continue and Back at the foot of the window.

## Where it appears

- Every recipe. `observed` on the source's public pages: 0 to 2 primary actions in every first window (`emphasis.primaries` [0, 2], typical 1), most often the header's join button in the top-right cell (38% of them); a sticky bar holds one on the plans page.

## Variations and triggers

- **Destructive:** solid red, only to confirm (Delete account).
- **A banner's action** (Retry now) is orange text on the near-black slab, so the page's orange button stays single.

## What it does not do

- Never three orange buttons in one window. The language keeps 1 or 2 (`emphasis.primaries` [1, 2] across its nine recipes).
- Never the signature orange (`color.brand.default`) as a button fill; it fails contrast under white text.
- No rounded pill buttons in the app; only the plan cards' buttons take 16px corners.

## Why

- `observed` and `inferred`: the source's pages always have one orange thing to press, usually joining or trying; the language carries that into the app as the bar's trial button.
