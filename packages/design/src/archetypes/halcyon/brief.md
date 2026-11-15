# Halcyon: the brief

Calm and exact: ink-violet text on white, one blue-violet accent kept for the moments money moves, four
light weights each with one job, pill buttons, small thin icons, cards on a ring shadow, tables and
details on hairlines, and figures with small raised cents. Read this first; the depth is in
[DESIGN.md](./DESIGN.md), [patterns/](./patterns/) and [never.md](./never.md). Numbers are from the
fingerprint (`fingerprint.json`, 27 screens) unless marked; `observed` = measured or seen on the source's
public screens (its public product demo and site), `inferred` = a reading of them.

## Signature moves

1. **Four weights, one job each:** 380 titles and figures, 400 text, 360 actions, 480 small labels. `observed`.
2. **One app frame everywhere:** the pale sidebar of three hairline groups and a bare top bar, kept on
   empty and error pages too. `observed`.
3. **Pills, and the accent rarely:** every button a pill at 360; the solid accent only where money
   moves or a flow ends; list pages act through a neutral pill. `observed`.
4. **12px thin icons** in nav, buttons and the top bar. `observed`.
5. **Raised cents;** gains green, losses ink with a minus. `observed`.
6. **Rows on hairlines, summaries on a ring shadow.** `observed`.
7. **Quiet states:** a centred 19px line, a sentence, at most one quiet pill; no icon. `observed` (the
   app's not-found and nothing-matches pages).

## Refusals

No bold title or figure · no 600 or 700 · no red for money out · no solid accent pill on a list page ·
no square button · no frame or filled header on a table · no large icons · no leaving the frame for an
empty or error state · no sidebar on public pages · no card border or coloured stripe. Evidence in
[never.md](./never.md).

## Three families

The **app** (sidebar and top bar, 28px/380 titles, 15px text), **flows** (onboarding, sign-in: a pale
ground, the mark, one white card) and **public pages** (pricing, reading: site bar, 57/42px headlines at
480, 16px text, the footer). See DESIGN.md, Page shapes.

## The five habits that matter most

1. **Four weights on every screen.** 4 [3.6, 4] on the recipes. `observed`: the source 4 [3, 5] over 66
   screens; app pages 360, 380, 400, 480.
2. **Small icons.** 12 [12, 12]px. `observed`: the source 12 [10, 14].
3. **Titles about twice the text.** The largest text is 2.15 [1.71, 3.10] times the body: 1.87 on app
   pages (28 over 15), 1.46 on sign-in, 3.56 on pricing. `observed`: the source 2.12 [1.81, 3.56]; app
   1.87–2.53, its log-in 1.27, its pricing 3.56.
4. **Five to seven text sizes.** 6 [5, 7]. `observed`: the source 6 [3.5, 9], app pages 6–10.
5. **Rows about 30px in navigation.** Sidebar items 30px on a 36px pitch; the typical row is 30 [21.5,
   74.6], the long ones a form's fields. `observed`: the source 32 [20, 34].

## Start from

Scan and open → `list-detail`. One thing → `list-detail`'s payment page. Daily screen → `dashboard`.
Settings → `settings`. A setup step → `onboarding`. Nothing yet → `empty-state`. Errors → `errors`. A post
or guide → `reading`. Logging in → `sign-in`. Marketing → `pricing`. See
[precedents/index.md](./precedents/index.md).
