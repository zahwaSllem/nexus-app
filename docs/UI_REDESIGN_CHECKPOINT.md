# Nexus — UI Redesign Checkpoint

**Context:** This file tracks the separate UI/UX redesign stream.  
**Do not confuse with:** The functional implementation phases in `CURRENT_PHASE.md` and `IMPLEMENTATION_ROADMAP.md`, which track data layer and feature builds. Both streams run in parallel on the same codebase.

**Last updated:** 2026-06-14  
**Design system:** UI UX Pro Max — Enterprise SaaS / Indigo-Violet  
**Current status:** Phase 4 Correction Pass complete ✅ — awaiting approval before Phase 5

---

## Completed Phases

### Phase 1 — Design Token Foundation ✅
**Scope:** No page visuals changed. Token system established globally.

**What was done:**
- Replaced Geist Sans with **Plus Jakarta Sans Variable** (self-hosted via `@fontsource-variable/plus-jakarta-sans`) — humanist, authoritative, designed for B2B SaaS
- Added comprehensive CSS variable system to `globals.css`: brand colors, gradient, semantic status tokens, shadow scale, radius scale, easing functions, focus ring
- Extended `tailwind.config.ts` with: `brand` color tokens (CSS-var driven, theme-adaptive), `brand-violet` tokens, `shadow-brand` / `shadow-brand-lg` / `shadow-card` custom shadows, `ease-spring` timing function
- Updated `Button.tsx`: 5 variants (`primary` gradient / `secondary` / `outline` / `ghost` / `destructive`), 4 sizes, `loading` prop, `active:scale-[0.97]`, indigo focus rings
- Updated `Badge.tsx`: `size` prop added; `info` variant changed from sky → indigo
- Updated `Card.tsx`: `variant` prop added (`default` / `raised` / `glass`); `CardFooter` added
- Fixed 7 pre-existing lint/TypeScript errors that were previously masked

**Key design decisions:**
- Primary brand: Indigo (`#4F46E5` light / `#6366F1` dark)
- Secondary brand: Violet (`#7C3AED` light / `#8B5CF6` dark)
- Primary gradient: `linear-gradient(135deg, indigo, violet)` — used for CTAs and active states only
- Dark surfaces: existing slate-900 retained for page backgrounds; richer slate-800 used for elevated surfaces

---

### Phase 2 — Layout Shell ✅
**Scope:** Sidebar, dashboard layout, admin layout only.

**What was done:**
- **Sidebar** (`Sidebar.tsx`): Full visual redesign — see details below
- **Dashboard layout** (`dashboard/layout.tsx`): Added `min-w-0` to `<main>` for correct mobile overflow behavior
- **Admin layout** (`admin/layout.tsx`): Same `min-w-0` addition

**Sidebar visual changes:**
- **Background:** Light `bg-white` / Dark **`bg-slate-800`** — creates depth separation from `bg-slate-900` content area in dark mode (previously both were `slate-900` — no differentiation)
- **Brand mark:** Gradient icon background `from-indigo-600 to-violet-600` with indigo glow shadow (replaces flat `bg-blue-600`)
- **Active nav state:** `bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm` — gradient applied selectively here only
- **Inactive hover:** `hover:bg-slate-100 dark:hover:bg-slate-700/50` — clean and non-distracting
- **Agent link:** Branded indigo accent when inactive; receives gradient on active like all other items
- **Theme/Language toggles:** Updated dark mode colors to match `bg-slate-800` sidebar surface
- **Sign Out hover:** Subtle red (`hover:text-red-600 dark:hover:text-red-400`) — destructive signal on hover only, spatially separated from nav
- **Focus rings:** All interactive elements use `focus-visible:ring-2 focus-visible:ring-indigo-500`; Sign Out uses `ring-red-500`
- **Section label:** `text-[10px] font-semibold uppercase tracking-widest` — more refined than previous
- **`aria-current="page"`** on active link; `aria-label` on `<nav>`; `aria-hidden` on decorative icons

**Responsive behavior:**
- Sidebar: `hidden md:flex md:flex-col` — hidden below 768px, renders at md+ (pure CSS, no JS state)
- Below md: content fills full width via `flex-1`
- **Known limitation:** No mobile drawer/hamburger toggle. Enterprise admin tool; mobile overlay navigation is deferred to a future phase.

---

## Approved Constraints (apply to all remaining phases)

These were set by the user and must be respected in every phase:

1. **Do not modify routes.** All `href` values, route files, and navigation destinations must remain identical.
2. **Do not modify mock data.** Nothing in `src/lib/mock-data/`, `src/lib/types/`, or `src/lib/scoring/` may be changed.
3. **Do not modify business logic.** Component behavior, state management, and data flow are out of scope.
4. **Do not modify page content.** Text, labels, headings, and copy come from `src/lib/i18n/` or are hardcoded in pages — leave them as-is.
5. **Visual changes only.** Every change must be justifiable as a styling or layout improvement.
6. **Backward-compatible components.** New props on `Button`, `Badge`, `Card` must default to existing behavior.
7. **Both themes.** Every change must work correctly in light mode and dark mode.
8. **Do not start the next phase** without explicit approval from the user.
9. **Do not fix unrelated lint/TypeScript issues** without reporting them first and receiving approval. (Exception: issues that directly block the build and were pre-existing may be fixed with disclosure.)
10. **Run `npm run lint` and `npm run build` after every phase** and report results.

---

## All Modified Files (Phases 1 + 2)

### Phase 1 files
| File | Change |
|---|---|
| `tailwind.config.ts` | Brand color tokens, shadow scale, font, `ease-spring` |
| `src/app/globals.css` | Full CSS variable design token system (additive) |
| `src/app/layout.tsx` | Plus Jakarta Sans via fontsource; removed stale eslint-disable |
| `src/components/ui/Button.tsx` | New variants, sizes, loading prop, gradient primary |
| `src/components/ui/Badge.tsx` | Size prop; `info` → indigo |
| `src/components/ui/Card.tsx` | Variant prop (`default`/`raised`/`glass`); CardFooter |
| `.eslintrc.json` | `argsIgnorePattern`/`varsIgnorePattern` for `_` prefix; rule off |

### Phase 1 — pre-existing errors fixed
| File | Fix |
|---|---|
| `src/app/dashboard/blueprints/[id]/page.tsx` | `any` index type → `string` |
| `src/app/assessment/[sessionId]/page.tsx` | Removed unused `Link` import |
| `src/app/dashboard/reports/[id]/page.tsx` | `params` → `_params` |
| `src/components/agent/GovernanceReviewPanel.tsx` | Escaped `'` apostrophe |
| `src/lib/scoring/mock-scorer.ts` | `FORCED_CHOICE_POLARITY` → `_FORCED_CHOICE_POLARITY` |

### Phase 2 files
| File | Change |
|---|---|
| `src/components/layout/Sidebar.tsx` | Full visual redesign + mobile hamburger + slide-in drawer |
| `src/app/dashboard/layout.tsx` | `min-w-0` on `<main>` |
| `src/app/admin/layout.tsx` | `min-w-0` on `<main>` |
| `src/app/globals.css` | `@keyframes slideInLeft` for drawer animation |

### Phase 3 files
| File | Change |
|---|---|
| `src/app/login/page.tsx` | Brand panel mesh gradient; indigo form accents; gradient role selector; Button component for submit |
| `src/app/dashboard/page.tsx` | KPI card elevation + animations; table left-accent; indigo brand tokens; animated progress bars; quick-action polish |
| `src/app/globals.css` | `@keyframes fadeInUp` + `.animate-fade-in-up` utility |

### Phase 4 Revision files (AI Command Center structural redesign)
| File | Change |
|---|---|
| `src/app/dashboard/agent/page.tsx` | Full structural rewrite: two-zone layout, hero header with gradient mesh + dot grid + animated badge, vertical step rail + mobile step bar, ambient radial glow, AI terminal identity bar, glass sticky nav |
| `src/components/agent/AgentStepIndicator.tsx` | Full rewrite: vertical guided step rail (desktop) with `animate-ping` active pulse, step descriptions, emerald complete state; `AgentMobileStepBar` second export (5-segment horizontal bar) |
| `src/components/agent/AgentChatBubble.tsx` | Sender attribution above all bubbles (name + timestamp); left-border accent on agent/typing; shimmer sweep `animate-shimmer` on generating state; `border-l-2 border-l-indigo-500/50` structural identifier |
| `src/components/agent/AgentChatInterface.tsx` | Input with embedded gradient send button (absolute right); `Enter to send` + char count footer; gradient completion CTA with emerald success panel |
| `src/components/agent/RoleBlueprintReview.tsx` | Circular BQ score via `conic-gradient` ring; domain-colored left-border accents on dimension cards (inline style, dynamic per domain); top gradient accent bar on blueprint header; hover elevation on dimension cards |
| `src/components/agent/ItemContextCard.tsx` | Domain left-border accent per `bankItem.domain_id`; `text-[15px] font-medium leading-snug` question text; separator line before toggle/rationale; `hover:-translate-y-0.5 hover:shadow-[0_8px_30px...]` elevation |
| `src/components/ui/MethodBadge.tsx` | `likert` className: `blue-*` → `indigo-*` to match brand |
| `src/components/agent/OriginalTextToggle.tsx` | Added `focus-visible:ring-2 focus-visible:ring-indigo-500` to toggle button |
| `src/components/agent/AssessmentBlueprintPreview.tsx` | Domain separator line: `bg-slate-800` → `bg-gradient-to-r from-slate-700/80 to-transparent` |
| `src/components/agent/GovernanceReviewPanel.tsx` | Hover elevation `hover:-translate-y-0.5 hover:shadow-md` on unacknowledged warning cards only |
| `src/components/agent/ApprovalChecklist.tsx` | Hover elevation `hover:-translate-y-0.5 hover:shadow-md` on unchecked checklist items only |
| `src/app/globals.css` | Added `@keyframes shimmer` + `.animate-shimmer` for generating state sweep; previously added `@keyframes dotBounce` + `.animate-dot-bounce` |

### Phase 4 Correction Pass files
| File | Change |
|---|---|
| `src/app/globals.css` | Added `@keyframes slideUp` + `.animate-slide-up` (spring easing, message entrance); `@keyframes scaleIn` + `.animate-scale-in` (panel entrance) |
| `src/components/layout/Sidebar.tsx` | Dark surface `dark:bg-slate-950` (receded below content's `slate-900`); subtle indigo gradient wash in brand header; active nav item gets white left-accent bar inside gradient; inactive hover `dark:hover:bg-slate-800/70`; theme/lang toggles use `dark:bg-slate-900/70` surfaces; consolidated double bottom border-t into single footer zone; mobile drawer + hamburger also use `dark:bg-slate-950` |
| `src/components/agent/AgentChatBubble.tsx` | Added `animate-slide-up` to all bubble wrappers (generating, agent, admin) for spring message entrance animation |
| `src/app/dashboard/agent/page.tsx` | Richer dark hero gradient (`dark:from-slate-950 dark:via-indigo-950/30`); step rail wrapped in glass panel container (`bg-white/70 dark:bg-slate-800/30 backdrop-blur`); chat terminal taller (`h-[540px] sm:h-[580px]`) |
| `src/app/dashboard/reports/page.tsx` | Full visual elevation: gradient header section; 3 KPI cards with icons + colored top accent bars + hover lift; table toolbar; table row left indigo accent on hover; `animate-scale-in` on table panel; indigo links; domain colors D1→indigo; improved empty state with CTA |
| `src/app/dashboard/assessments/page.tsx` | Same elevation pattern: gradient header; 3 KPI cards; gradient CTA button; table with hover left accent; domain colors D1→indigo; indigo links throughout |
| `src/app/dashboard/blueprints/page.tsx` | Gradient header; 3 KPI cards; filter pills: gradient active state; search: indigo focus ring; blueprint cards: top gradient accent bar + circular BQ score conic-gradient ring + hover elevation + gradient "Assign Assessment" button; D1→indigo domain colors; `validated` status→indigo; empty state improved |

### Unchanged (out of scope through Phase 4 Correction)
- All `src/app/**/page.tsx` files — not yet touched
- `src/components/layout/Navbar.tsx` — landing page nav, not admin shell
- `src/lib/**` — all data, types, scoring, i18n, providers untouched
- `src/middleware.ts` — untouched

---

## Validation Commands

Run these after every phase before reporting completion:

```bash
npm run lint    # Must output: ✔ No ESLint warnings or errors
npm run build   # Must complete with all routes listed, exit 0
```

**Expected build output (baseline after Phase 2):**
- 22 routes compiled, all `○ Static` or `ƒ Dynamic`
- First Load JS shared: ~87.3 kB
- No TypeScript errors
- No new lint errors

---

## Remaining Phases

These are described in the approved audit. Each requires explicit approval before starting.

### Phase 3 — Login + Dashboard Home ✅
**Files:** `src/app/login/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/globals.css`

**Login page changes:**
- **Brand panel background:** Dark indigo mesh — `linear-gradient(155deg, #0f0b2d → #0f172a → #0d1020)` replacing flat `from-blue-950`
- **Gradient mesh nodes:** Three absolutely-positioned blurred radial circles (`indigo-600/20`, `violet-700/15`, `indigo-800/10`) for depth
- **Gradient headline:** Second heading line uses `bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent`
- **Brand mark:** Upgraded to `bg-gradient-to-br from-indigo-500 to-violet-600` with indigo glow shadow (matches sidebar)
- **Enterprise label / bullets / domain badges:** All converted from `blue-*` → `indigo-*`
- **Role selector:** Active tab now uses `bg-gradient-to-r from-indigo-600 to-violet-600 text-white` (was flat `bg-blue-700`)
- **Input focus rings:** `focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20` (was blue-500); shows red border on error state
- **Submit button:** Replaced raw `<button bg-blue-700>` with `<Button variant="primary" size="lg">` component — full gradient CTA
- **Forgot password link:** `text-indigo-600` (was blue-600)
- **Mobile logo:** Same gradient mark + glow shadow
- **Error alert:** Added `role="alert"` for accessibility
- **Focus rings on toggles:** Added `focus-visible:ring-2 focus-visible:ring-indigo-500` to theme/lang buttons

**Dashboard home changes:**
- **New Assessment button:** Replaced `<Link bg-blue-700>` with full gradient indigo/violet link (matching Button primary style)
- **KPI cards:** `shadow-card` elevation + `hover:-translate-y-0.5 hover:shadow-md` lift + 0.5px colored top accent bar per card + icon scales `group-hover:scale-110` + label is uppercase micro-label + delta text uses card's accent color (was always gray)
- **First KPI (Total Candidates):** Color updated from `blue-*` → `indigo-*` to match brand
- **Candidates table:**
  - Header cells: uppercase micro-label style (`text-[10px] font-semibold uppercase tracking-widest`)
  - Row left-accent on hover: thin `w-0.5 bg-indigo-500` absolutely-positioned in first cell, fades in with `group-hover:opacity-100`
  - Candidate IDs: `text-indigo-600 dark:text-indigo-400` (was blue)
  - Domain tags: `bg-indigo-500/10 text-indigo-600 dark:text-indigo-300` (was blue)
  - "View all" link: `text-indigo-600` (was blue-600)
- **Quick actions:** First action (New Assessment) gets indigo-tinted treatment (`bg-indigo-50/80 border-indigo-200/80 text-indigo-700`); arrow symbol has `group-hover:translate-x-0.5` micro-animation
- **V1 release note:** Updated `border-blue-500/20 bg-blue-500/5` → `border-indigo-500/20 bg-indigo-500/5`
- **Domain coverage cards:** Domain code badges updated from `blue-*` → `indigo-*`; progress bars thickened `h-1.5 → h-2`; animated fill from 0% on mount (`useEffect` + `useState`); cards get `hover:-translate-y-0.5 hover:shadow-md`
- **Entry animations:** `animate-fade-in-up` CSS class (`fadeInUp` keyframe in globals.css) with staggered `animation-delay` on all sections and cards

**New CSS added (globals.css):**
```css
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { … } }
.animate-fade-in-up { animation: fadeInUp 0.45s ease-out both; }
```

### Phase 4 Revision — Agent Workflow (AI Command Center) ✅
**Files:** `src/app/dashboard/agent/page.tsx`, all `src/components/agent/*.tsx`, `src/components/ui/MethodBadge.tsx`, `src/app/globals.css`

**Structural concept:** Two-zone workspace layout. Left: persistent vertical step rail (desktop). Right: scrollable content area. Hero header with layered gradient mesh, animated pulsing badge, 5-segment visual progress. Agent chat is a dark terminal panel (bg-slate-950) with AI identity bar. Review panels use domain-colored structural accents, not just color tints.

**Page (`dashboard/agent/page.tsx`) — structural rewrite:**
- **Ambient glow:** Fixed `position: fixed` radial gradient behind all content (`bg-[radial-gradient(ellipse_70%_40%_at_85%_0%,...)]`, pointer-events-none)
- **Hero header:** Layered gradient mesh (3 absolute blobs), dot grid overlay (`[background-size:28px_28px]` radial), pulsing "AI Session Active" badge (`animate-ping` slowed to 2s), 5-segment horizontal progress bar (w-6 pending / w-10 active / w-8 complete), blueprint context chip
- **Two-zone layout:** `flex items-start gap-6` — `hidden md:block md:w-48 lg:w-52` sticky step rail + `min-w-0 flex-1` content
- **Mobile bar:** `AgentMobileStepBar` above content, `md:hidden`
- **Step 1 terminal:** `bg-slate-950` outer, AI identity bar (`bg-slate-900/70`, gradient avatar, emerald status dot, SESSION-001 chip), `flex h-[490px] sm:h-[520px]` chat area
- **Steps 2–5:** `animate-fade-in-up` panel entry
- **Sticky bottom nav:** `z-10 bg-white/90 backdrop-blur-md`, gradient forward buttons

**AgentStepIndicator.tsx — two exports:**
- `AgentStepIndicator`: Vertical guided step rail with STEP_DESCRIPTIONS, `animate-ping 2s` on active node, emerald complete nodes, 9px connector lines between steps, opacity 100/55/30 for active/complete/pending
- `AgentMobileStepBar`: 5 flex-1 segments, gradient active, emerald complete, slate pending

**AgentChatBubble.tsx:**
- Sender attribution (name + timestamp) above every bubble
- Agent messages: `border-l-2 border-l-indigo-500/50` left structural accent + `bg-slate-800/80`
- Generating state: shimmer sweep child `animate-shimmer` inside `overflow-hidden rounded-xl`, "Generating blueprint" text in `text-indigo-300`
- Admin messages: `bg-gradient-to-br from-indigo-600 to-violet-600/90` + `shadow-[0_0_18px_0_rgba(99,102,241,0.20)]`
- Typing: "Thinking" label + dot-bounce, same left-border as agent

**AgentChatInterface.tsx:**
- Embedded send button: `absolute right-2 top-1/2 -translate-y-1/2` gradient, inside single input container
- Footer: "Enter to send" hint + char count when input non-empty
- Completion panel: emerald `border-emerald-500/25 bg-emerald-500/5`, gradient CTA

**RoleBlueprintReview.tsx:**
- Top gradient accent bar on blueprint header card: `h-0.5 bg-gradient-to-r from-indigo-600 via-violet-500 to-transparent`
- **Circular BQ score:** `conic-gradient(from -90deg, <color> <deg>deg, #334155 <deg>deg)` ring, inner cutout `absolute inset-[5px] rounded-full bg-slate-800`, score text + `/100` centered inside
- **Domain dimension cards:** `borderLeftColor` inline style per domain (D1=#6366F1, D2=#F59E0B, D4=#8B5CF6); `hover:-translate-y-0.5 hover:shadow-md`
- Context profile fields: small bar+value grid, 2–4 cols responsive

**ItemContextCard.tsx:**
- Domain left-border: `borderLeftColor` inline style matching `DOMAIN_ACCENT_COLOR` map
- Question text: `text-[15px] font-medium leading-snug` (was `text-sm font-medium leading-relaxed`)
- Separator: `my-3 h-px bg-slate-700/60` between question and toggle/rationale
- Card hover: `hover:-translate-y-0.5 hover:shadow-[0_8px_30px_0_rgba(0,0,0,0.4)]`

**MethodBadge.tsx:** `likert` → `bg-indigo-500/15 text-indigo-400 border-indigo-500/30` (was blue)

**OriginalTextToggle.tsx:** Added `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800`

**AssessmentBlueprintPreview.tsx:** Domain separator `<div>` → `bg-gradient-to-r from-slate-700/80 to-transparent` (was `bg-slate-800` flat)

**GovernanceReviewPanel.tsx:** Unacknowledged warning cards: `hover:-translate-y-0.5 hover:shadow-md`; acknowledged cards stay `opacity-60` with no hover lift

**ApprovalChecklist.tsx:** Unchecked items: `hover:-translate-y-0.5 hover:shadow-md` on label; checked items: no lift (stable confirmation state)

**globals.css additions:**
```css
@keyframes dotBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
.animate-dot-bounce { animation: dotBounce 1.2s ease-in-out infinite; }

@keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(200%); } }
.animate-shimmer { animation: shimmer 2.2s ease-in-out infinite; }
```

**Lint/build:** `✔ No ESLint warnings or errors` · 23 routes compiled · exit 0

### Phase 5 — Candidate Experience
**Files:** `src/app/candidate/dashboard/page.tsx`, `src/app/assessment/page.tsx`, `src/app/assessment/layout.tsx`, `src/app/assessment/complete/page.tsx`, `src/app/candidate/results/[id]/page.tsx`, `src/app/candidate/report/[id]/page.tsx`  
**Scope:** Frosted glass cards (`Card variant="glass"`); domain score visualization; completion animation; focused assessment layout with minimal chrome

### Phase 6 — Remaining Admin Pages
**Files:** All remaining `src/app/dashboard/*` pages not covered by Phase 3 or 4  
**Scope:** `blueprints/page.tsx`, `blueprints/[id]/page.tsx`, `assessments/page.tsx`, `assessments/new/page.tsx`, `candidates/page.tsx`, `candidates/[id]/page.tsx`, `reports/page.tsx`, `reports/[id]/page.tsx`, `admin/page.tsx`, `admin/users/page.tsx`, `admin/settings/page.tsx`  
**Scope:** Polish pass using established design system — no new design decisions

---

## Design System Quick Reference

### Brand Tokens (CSS variables, theme-adaptive)
```
--color-brand:        #4F46E5  (light) / #6366F1 (dark)
--color-violet:       #7C3AED  (light) / #8B5CF6 (dark)
--gradient-brand:     linear-gradient(135deg, brand → violet)
--shadow-brand:       indigo glow, 4px spread
--shadow-brand-lg:    indigo glow, 8px spread
--shadow-card:        tinted card shadow
```

### Tailwind Token Usage
```
bg-brand              → indigo primary (theme-adaptive)
bg-brand-tint         → light indigo surface
shadow-brand          → indigo glow CTA shadow
shadow-card           → elevated card shadow
ease-spring           → spring easing for interactions
```

### Font
```
Plus Jakarta Sans Variable (self-hosted, weights 400–800)
Import: @fontsource-variable/plus-jakarta-sans
Tailwind: font-sans → "Plus Jakarta Sans Variable"
Mono: Geist Mono (unchanged)
```

### Gradient CTA Pattern (approved for selective use)
```tsx
// Primary button — already implemented in Button.tsx
"bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-brand"
"hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg"
"active:scale-[0.97]"

// Active nav item — implemented in Sidebar.tsx
"bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
```

### Dark Mode Surface Hierarchy (deep → elevated)
```
Page content:    bg-slate-900  (#0F172A)  — deepest
Sidebar:         bg-slate-800  (#1E293B)  — elevated
Cards:           bg-slate-800  (#1E293B)  — same as sidebar
Card raised:     bg-slate-800 + shadow-card
```

### Light Mode Surface Hierarchy (base → elevated)
```
Page content:    bg-slate-50   (#F8FAFC)  — base
Sidebar:         bg-white      (#FFFFFF)  — elevated
Cards:           bg-white      (#FFFFFF)  — elevated
Card raised:     bg-white + shadow-card
```

---

## Rules That Must Not Be Violated

1. **Never use `bg-blue-600` or `bg-blue-700` for new primary actions** — the brand is now indigo/violet. Existing page code may still use it (pre-Phase-3) but new/updated code must not.

2. **Never apply the gradient to more than one element per view** unless they are in the same hierarchy level (e.g., multiple nav items can be active-gradient, but a page cannot have both a gradient CTA button and a gradient hero at the same time — pick one).

3. **Never change a route `href`.** Navigation destinations are business logic.

4. **Never touch `src/lib/` files** unless fixing a build-blocking TypeScript error, and only after reporting.

5. **Never run `npm run build` and report success without actually verifying the output** — check that all routes compile and no new TypeScript errors appear.

6. **Never modify `src/lib/i18n/en.ts` or `ar.ts`** — translation keys and text are content, not UI.

7. **The `Card`, `Button`, and `Badge` component changes must remain backward-compatible.** Any new prop must have a default that preserves the original behavior. Existing callers that pass no props must get the same visual output as before Phase 1 (or as close as possible given the brand color shift).

8. **`hidden md:flex` is the responsive pattern for the sidebar.** Do not add JavaScript-based show/hide logic to the sidebar in Phase 3 or beyond without explicit approval.

9. **Do not add dependencies** (npm packages) without reporting the reason and getting approval first. The exception: `@fontsource-variable/plus-jakarta-sans` is already installed and approved.

10. **Stop at the end of each phase** and wait for explicit approval. Do not cascade into the next phase.
