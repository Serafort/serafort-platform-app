# Auth module: Serafort brand UI spec

Source: `G:\My Drive\SeraFort\serafort_brand\brand-kit\Claude outputs` (tokens.css, foundations, principles, standards, uikit).
Every brand token already ships as a `--sf-*` CSS var from `@cap/theme` (`tokens/brand.ts` roles + `tokens/serafort-aliases.ts`
scales, mode aware). Use them with a theme fallback: `var(--sf-radius-lg, 12px)`. Never type a hex. If a token is missing, add it
in `packages/theme/src/tokens/`, not in a screen.

## 1. Token to MUI mapping

| Need | Use |
|---|---|
| Page ground / card / sunken | `background.default` (`--sf-bg`) / `background.paper` (`--sf-surface`) / `--sf-surface-sunken` |
| Hairline | `divider` (`--sf-border`), width `--sf-border-1`; emphasis 2px only for focus / active tab / status stripe |
| Text | `text.primary` (ink), `text.secondary` (slate-600), `--sf-text-tertiary` for meta, captions, table heads |
| Text on a semantic tint | `--sf-{success,warning,error,info}-text` (AA safe). Raw `palette.x.main` is for dots, icons, borders only |
| Semantic tint pair | `--sf-x-bg` + `--sf-x-border` (badges, alerts). Prefer them over `alpha()` guesses |
| Link | `--sf-link` (deep blue light, cyan dark) |
| CTA | one primary per view, in theme `primary` (tenant driven; default preset = brand blue). Brand ink/cyan CTA applies where the tenant preset is the brand one. Cyan `--sf-accent` = the single most important action only |
| Fonts | display `--sf-font-display` (Space Grotesk) for h1/h2/stat figures; body `--sf-font-body`; mono `--sf-font-mono` for table heads, badges, codes, eyebrows |
| Type scale | 2xs 11, xs 12, sm 13, base 14 (body/UI), md 15 (card titles, nav), lg 17 (dialog h), xl 23 (h2), 2xl 30 (stat, page h1), 3xl 38 (hero) via `--sf-text-*` |
| Spacing | 4px scale `--sf-space-*` (MUI `theme.spacing` is 8px: 0.5 = 4). Label to field 6-8px; group gaps 16-24; section gaps 32+ |
| Radius | xs 4 chips, sm 6 dense controls, md 8 buttons/inputs, lg 12 cards/panels/tables, xl 16 modals, full pills/avatars |
| Elevation | lowest that reads: card at rest `--sf-shadow-sm`, hover `-md`, menus `-lg`, dialogs `-xl`. Tinted, never `rgba(0,0,0,..)` literals |
| Focus | `--sf-shadow-glow` on inputs (info-blue 15% ring + blue border); `outline: 2px solid var(--sf-cyan); outline-offset: 2px` on buttons/links/rows |
| Motion | fast 120 (toggles), base 180 (buttons, menus), slow 280 (modals, panels). `--sf-ease-standard`; enter `--sf-ease-out`, exit `--sf-ease-in`. Always add `@media (prefers-reduced-motion: reduce)` to kill transform/animation |
| Targets | controls 48px min in auth funnel (44 min anywhere), icon buttons 44x44 |
| z-index | named layers only (`--sf-z-*`): sticky 200, overlay 300, modal 400, toast 500 |

## 2. Component recipes (use the shared kit, do not hand roll)

- **Button** (`AuthActionButton`): 48px, `--sf-radius-md`, 600 weight, 14-15px, no shadow at rest (`--sf-shadow-sm` on hover only), disabled = flat mist fill, loading = inline spinner + label kept, `aria-busy`.
  Secondary = outline (hairline, blue border on hover). Tertiary = ghost. Destructive = `error` solid, only inside a confirm.
- **Input** (`AuthTextField`): label ABOVE (13px, 600, text.primary, sentence case, not uppercase), field 48px, `--sf-radius-md`, `--sf-field-bg`,
  hint 12px tertiary, error text = `--sf-error-text` + `aria-invalid` + `aria-describedby`.
- **Card** (`AuthCard`): `--sf-surface`, 1px `--sf-border`, `--sf-radius-xl` (auth) / `-lg` (admin), `--sf-shadow-lg` (auth, floating on the wash) / `-sm` (admin). Padding 24 mobile, 32-40 desktop.
- **Badge** (`AuthStatusBadge`, `AdminStatusBadge`): pill, dot + mono 12px label, `--sf-x-bg/-border/-text`. Colour + text + dot, never colour alone.
- **Alert**: 12px gap, 14/16 padding, `--sf-radius-md`, tint pair, bold lead line (what happened) then one sentence (what to do). `role="alert"` for errors, `status` otherwise.
- **Table** (`AdminTableCard` + `AdminTableHeadCell` + `AdminTableRow`): card radius-lg, header mono 11px uppercase 0.05em tertiary, cells 12x16, body 14px tabular-nums, row hover `--sf-surface-sunken`, clickable rows keyboard operable, 44px row actions. No zebra.
- **Dialog** (`ConfirmationDialog`): radius-xl, shadow-xl, scrim `rgba(ink, .55)`, title 17px display, body 14px secondary, actions right aligned (Cancel ghost, confirm solid), focus trap, Esc closes. Name the loss in destructive copy.
- **Stat / metric** (`AdminStatCard`): display font 30px figure, mono 11px uppercase caption, delta mono 12px in `--sf-success-text`.

## 3. Page anatomy

- **Auth funnel (centred card)**: `AuthPageLayout` (ambient wash + brand mark) > `AuthCard` > `AuthCardHeader` (icon 56, h1 display 24-28px 700, subtitle 14-15px secondary, 8px gap) > form (16px between fields, 24px before the single primary button) > secondary links (13px, `--sf-link`) > `AuthSecurityNote`.
  Max width 440-480. One h1 per screen. Multi-step flows show `AuthStepProgress` (max 4-5 steps, Miller).
- **Outcome screens**: `AuthOutcomeScreen` (tone icon, tone-free h1 in text.primary, one sentence, one primary CTA, one ghost link). Success ends the flow with the next action named.
- **Admin surfaces**: `AdminPageHeader` (eyebrow/breadcrumbs mono 12px, h1 display 30px, description 14px secondary, actions right) > stat row (max 4) > filter bar (`AdminSearchField` 48px) > `AdminTableCard`. Sections separated by 32px.
- Mobile 390px: card goes edge-safe (16px gutter), button full width, table scrolls inside its card, header actions wrap under the title.

## 4. Four states (mandatory on every data view)

| State | Recipe |
|---|---|
| Empty | `AdminEmptyState`: 64px icon tile (tone tint, radius-lg), 17px title, 14px why + what would appear, ONE onboarding CTA |
| Loading | skeleton rows shaped like the real rows (`AdminDataState`), never a lone spinner; buttons keep width and show spinner; feedback < 400ms |
| Success | toast bottom-inline-end (3-5s, closable, `role=status`) or optimistic update; outcome screen for terminal flows |
| Error | inline, in place: error tint alert or `AdminEmptyState variant='error'` with retry; 5xx copy sanitised, never raw server text; field errors under the field |

## 5. Global rules

Zero hard coded colour/string (`t('key','default')` + en/fr/ar). RTL: logical props (`marginInlineStart`, `insetInlineEnd`, `textAlign: 'start'`),
swap arrow glyphs by `theme.direction`. Icon-only buttons need `aria-label`. One primary action per view (Von Restorff / Hick).
Chunk groups to 5-7 items (Miller). Copy leads with the outcome, no apology, no filler. Reduced motion respected.
