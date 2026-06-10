# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**FIP — Food Intelligent Platform**: an ERP for the food industry, built **front-end first as a clickable prototype** (UI and flows before any real backend). Data is mocked and persisted to `localStorage`; there is no server.

The first and only module built so far is **Role & Permission** (บทบาท & สิทธิ์) — an RBAC role-*authoring* surface. It defines roles and permissions; it never assigns them to people (assignment is a separate, out-of-scope module). The UI is in Thai. See `DESIGN_Permission_Role_Module.md` for the full spec (EARS requirements REQ-001…009).

### Core domain concepts (read before touching the model)

- **Two role types:** `PRODUCT` (scoped to one product — POS or QSC — holds operational permissions) vs `SYSTEM` (cross-product governance: Manage Role / Manage Permission / View Audit — never operational).
- **Two sources:** `SYSTEM_DEFAULT` (TBC-owned templates, read-only to tenants, cloned via "Duplicate to customize") vs `CUSTOM` (tenant-authored).
- **Permission tree:** `Product → Module → Action`. Each module grant has a **mode**: `specific` (sel = granted actions) or `all_except` (sel = *excluded* actions; everything else is granted, including actions added to the catalog later). This `all_except` semantics is the trickiest part of the model — see `src/lib/grants.ts`.
- **Lifecycle:** `draft → published → archived`. An empty role (0 granted actions) can be saved as draft but cannot be published.
- **Two personas:** `tbc` (TBC Platform Admin — can create System roles, edit defaults) vs `tenant` (Tenant Admin — own tenant only, no System-role creation in V1, clone-only on defaults). The persona is a UI-level switch (header control), not real auth.
- **Guards (REQ-007/008/009):** assigned roles can't be hard-deleted (→ archive); last role holding `iam.manage_role` can't be archived (last-admin protection); tenant isolation.

## Commands

```bash
npm run dev       # Vite dev server (HMR)
npm run build     # tsc -b (typecheck) + vite build → dist/
npm run preview   # serve the production build
npm run lint      # eslint
```

There is no test suite yet. `npm run build` is the verification gate — it runs the full TypeScript typecheck (strict, including `noUnusedLocals`/`verbatimModuleSyntax`) before bundling.

## Stack

Vite + React 19 + TypeScript. **shadcn/ui** is initialized (Tailwind v4, `components.json`, `@/` alias → `src/`, `cn()` in `src/lib/utils.ts`) and available for future modules. Add components with `npx shadcn@latest add <name>`.

> **The Role & Permission module does NOT use shadcn components.** It is a pixel-faithful port of a bespoke custom-CSS design handed off from Claude Design. That design system lives in `src/styles/` (`tokens.css`, `shell.css`, `surfaces.css`, `roles.css`) and is the source of visual truth for this module — edit those files (or the components' class names) to change its look, not Tailwind utilities or shadcn tokens. The shadcn token layer in `src/index.css` is namespaced separately and does not affect it.

## Architecture

Single-page app. `src/App.tsx` is the settings-modal shell (left nav + content); the only live section is `roles`.

**Domain layer (`src/lib/`)** — keep all model logic here, not in components:
- `types.ts` — all domain types (`Role`, `Grant`, `Grants`, `RoleType`, etc.).
- `catalog.ts` — products, the POS/QSC/Platform permission catalog, lookup helpers (`catalogFor`, `roleGrantStats`), and badge maps. Adding a product/module/action is a config change here — no core code changes (per the spec's extensibility requirement).
- `seed.ts` — the demo roles + audit trail.
- `grants.ts` — grant math and mutators: `effectiveSet`, `modState`, `toggleAction`, `toggleModuleAll`, `switchMode`, `catalogGroups`, `roleHoldsManageRole`. This encodes the `specific`/`all_except` rules.
- `store.ts` — `localStorage`-backed roles store via `useSyncExternalStore` (`useRoles()` hook + `rolesStore` mutators: create/update/archive/reset) and persisted UI prefs (persona/density/permVariant).

**Components (`src/components/`)** — presentational, driven by props from `App`:
- `Icon.tsx` (the lucide-style icon set), `primitives.tsx` (badges, product chips, avatars, `useClickOutside`).
- `RoleDirectory.tsx` (list + filters + tabs), `RoleForm.tsx` (inline create/edit/duplicate; builds a full role payload and returns it via `onSaved` for the store to persist), `RoleDrawer.tsx` (detail drawer + archive/last-admin guard dialogs), `PermEditor.tsx` (tree / two-pane / compact variants + read-only summary), `PersonaControls.tsx` (header persona switcher + view options + reset-demo, replacing the design tool's floating Tweaks panel).

## Conventions

- Prototype: prioritize working flows and visual fidelity. Keep the permission model typed and self-contained in `src/lib/` so a real backend can replace `store.ts` without touching components.
- `verbatimModuleSyntax` is on — use `import type { … }` for type-only imports or the build fails.
- The reference design files (the original HTML/JSX handoff) are not in the repo; they were extracted to `/tmp/fip-design/pos/project/` during the initial port. The `src/styles/*.css` files are verbatim copies of that design's CSS.
