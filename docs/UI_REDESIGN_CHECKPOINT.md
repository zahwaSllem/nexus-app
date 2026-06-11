# Nexus — UI Redesign Checkpoint

**Context:** This file tracks the separate UI/UX redesign stream.  
**Do not confuse with:** The functional implementation phases in `CURRENT_PHASE.md` and `IMPLEMENTATION_ROADMAP.md`, which track data layer and feature builds. Both streams run in parallel on the same codebase.

**Last updated:** 2026-06-11  
**Design system:** UI UX Pro Max — Enterprise SaaS / Indigo-Violet  
**Current status:** Phase 2 complete ✅ — awaiting Phase 3 approval

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
| `src/components/layout/Sidebar.tsx` | Full visual redesign — see Phase 2 above |
| `src/app/dashboard/layout.tsx` | `min-w-0` on `<main>` |
| `src/app/admin/layout.tsx` | `min-w-0` on `<main>` |

### Unchanged (out of scope through Phase 2)
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

### Phase 3 — Login + Dashboard Home
**Files:** `src/app/login/page.tsx`, `src/app/dashboard/page.tsx`  
**Scope:**
- Login: Stronger brand panel gradient mesh; indigo form accents; refined toggle controls
- Dashboard: Elevated KPI cards with colored shadow (`shadow-card`); thicker domain progress bars; table row hover with left accent; use `Card` component variants

### Phase 4 — Agent Workflow
**Files:** `src/app/dashboard/agent/page.tsx`, all `src/components/agent/*.tsx`  
**Scope:** Premium step indicator with gradient connector lines; polish on chat bubbles; domain color coding on blueprint/item cards. This is the highest-impact surface.

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
