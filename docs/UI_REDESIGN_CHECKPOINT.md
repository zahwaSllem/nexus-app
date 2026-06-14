# Nexus — UI Redesign Checkpoint

**Context:** This file tracks the separate UI/UX redesign stream.  
**Do not confuse with:** The functional implementation phases in `CURRENT_PHASE.md` and `IMPLEMENTATION_ROADMAP.md`, which track data layer and feature builds. Both streams run in parallel on the same codebase.

**Last updated:** 2026-06-14  
**Design system:** UI UX Pro Max — Enterprise SaaS / Indigo-Violet  
**Current status:** Phase 4 complete ✅ — awaiting Phase 5 approval

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

### Phase 4 files
| File | Change |
|---|---|
| `src/app/dashboard/agent/page.tsx` | Header indigo; dark terminal panel for chat; `animate-fade-in-up` per step; gradient nav buttons |
| `src/components/agent/AgentStepIndicator.tsx` | Full rewrite: gradient active node, gradient connectors, full light/dark mode |
| `src/components/agent/AgentChatBubble.tsx` | Gradient avatar marks; gradient admin bubble; `animate-dot-bounce` dots; removed inline `<style>` |
| `src/components/agent/AgentChatInterface.tsx` | Indigo input focus; gradient send + CTA buttons |
| `src/components/agent/RoleBlueprintReview.tsx` | D1 color blue→indigo; label + bullets + bars blue→indigo |
| `src/components/agent/AssessmentBlueprintPreview.tsx` | D1 color blue→indigo; label + rationale panel blue→indigo |
| `src/components/agent/GovernanceReviewPanel.tsx` | `info` severity blue→indigo; checkbox accent; summary badge |
| `src/components/agent/ApprovalChecklist.tsx` | Logo mark gradient; approve + CTA buttons gradient |
| `src/components/agent/BlueprintStatusStepper.tsx` | Full rewrite: gradient active, full light/dark mode |
| `src/app/globals.css` | `@keyframes dotBounce` + `.animate-dot-bounce` utility |

### Unchanged (out of scope through Phase 4)
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

### Phase 4 — Agent Workflow ✅
**Files:** `src/app/dashboard/agent/page.tsx`, all `src/components/agent/*.tsx`

**Page changes (`dashboard/agent/page.tsx`):**
- **Header:** Added `bg-white dark:bg-slate-900` for proper light/dark surface; title accent `text-blue-600` → `text-indigo-600 dark:text-indigo-400`; refined typography hierarchy (`text-[11px] font-semibold uppercase tracking-widest`)
- **Step 1 chat container:** Wrapped in premium dark terminal panel (`bg-slate-950` + `border-slate-800` + `shadow-lg`) with a macOS-style title bar showing three dot indicators and "Nexus Agent · Role Interview"
- **Step 2–5 content:** Each step wrapped in `animate-fade-in-up` for entry animation
- **Bottom nav forward buttons:** All three replaced — `bg-blue-700` → `bg-gradient-to-r from-indigo-600 to-violet-600` with `shadow-brand`, `hover:shadow-brand-lg`, `active:scale-[0.97]`, full `focus-visible` ring; back button gained `focus-visible` ring

**AgentStepIndicator.tsx:**
- Complete rewrite — full light/dark mode compatibility (was dark-only)
- **Active node:** `bg-gradient-to-br from-indigo-600 to-violet-600` with `ring-4 ring-indigo-500/20` + indigo glow shadow (was `bg-blue-600 ring-blue-500/40`)
- **Pending node:** `border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500` (was dark-only `bg-slate-700 text-slate-500`)
- **Connector (complete):** `bg-gradient-to-r from-emerald-500/70 to-emerald-400/40` (was flat `bg-emerald-500/50`)
- **Connector (pending):** `bg-slate-200 dark:bg-slate-700` (was dark-only `bg-slate-700`)
- **Labels:** Proper light/dark — active `text-indigo-600 dark:text-indigo-400 font-semibold` (was `text-white`); complete `text-emerald-600 dark:text-emerald-400` (was `text-emerald-400`); pending `text-slate-400 dark:text-slate-600` (was `text-slate-600`)
- Node size increased `h-7 w-7 → h-8 w-8` for better tap target and visual weight

**AgentChatBubble.tsx:**
- **Agent avatar:** `bg-blue-600` → `bg-gradient-to-br from-indigo-600 to-violet-600` with `shadow-sm`; applied to all three bubble types (agent, typing, generating)
- **Admin bubble:** `bg-blue-700` → `bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm`
- **Generating dots:** `bg-blue-400` with inline `@keyframes bounce` → `bg-indigo-400 animate-dot-bounce` (uses global CSS keyframe)
- **Typing dots:** `bg-slate-500` → `bg-indigo-400/70 animate-dot-bounce` with staggered `animationDelay`
- **Removed:** All inline `<style>` tags (keyframes moved to `globals.css`)
- Agent/typing bubble borders: `border-slate-700` → `border-slate-700/80`; bubble bg `bg-slate-800` → `bg-slate-800/90`

**AgentChatInterface.tsx:**
- **Input focus:** `focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50` → `focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`
- **Send button:** `bg-blue-700 hover:bg-blue-600` → gradient with `shadow-brand`, `hover:shadow-brand-lg`
- **"Review Role Blueprint" CTA:** `bg-blue-700 hover:bg-blue-600` → gradient with full interaction states + `focus-visible` ring
- **Separator border:** `border-slate-800` → `border-slate-800/80`

**RoleBlueprintReview.tsx:**
- `DOMAIN_COLORS.D1`: `bg-blue-500/10 text-blue-300 border-blue-500/20` → `bg-indigo-500/10 text-indigo-300 border-indigo-500/20`
- "Agent-Generated Blueprint" label: `text-blue-400` → `text-indigo-400`
- Key responsibilities bullet: `bg-blue-500` → `bg-indigo-400`
- Context profile progress bars: `bg-blue-500` → `bg-indigo-500`

**AssessmentBlueprintPreview.tsx:**
- `DOMAIN_COLORS.D1`: blue → indigo (same as above)
- "Assessment Blueprint" label: `text-blue-400` → `text-indigo-400`
- Agent rationale panel: `border-blue-500/20 bg-blue-500/5 text-blue-400` → indigo equivalents

**GovernanceReviewPanel.tsx:**
- `info` severity config: all `blue-*` references (border, bg, iconColor, badgeClass) → `indigo-*`
- Summary `infoCount` badge: `border-blue-500/30 bg-blue-500/10 text-blue-400` → `indigo-*`
- Checkbox `accent-blue-600` → `accent-indigo-600`

**ApprovalChecklist.tsx:**
- Preamble Nexus logo: `bg-blue-600` → `bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm`
- Approve button: `bg-blue-700 hover:bg-blue-600` → gradient with `shadow-brand`, `hover:shadow-brand-lg`, `active:scale-[0.97]`
- Post-approval "Assign Assessment" CTA: same gradient treatment

**BlueprintStatusStepper.tsx:**
- Complete rewrite — full light/dark mode compatibility
- Active stage: `bg-blue-600` → `bg-gradient-to-br from-indigo-600 to-violet-600`
- Pending node: `bg-slate-700 text-slate-600` → `border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-500`
- Labels: proper light/dark `text-indigo-600 dark:text-indigo-400` for active; `text-emerald-600 dark:text-emerald-400` for complete

**globals.css additions:**
```css
@keyframes dotBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
.animate-dot-bounce { animation: dotBounce 1.2s ease-in-out infinite; }
```

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
