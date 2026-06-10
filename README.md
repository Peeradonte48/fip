# FIP — Food Intelligent Platform

A front-end prototype for a food-industry ERP. Built UI-first: data is mocked and persisted to `localStorage`, no backend.

The first module is **Role & Permission** (บทบาท & สิทธิ์) — an RBAC role-authoring surface (define roles & permissions; assignment lives in a separate module). UI is in Thai.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts: `npm run build` (typecheck + bundle), `npm run preview`, `npm run lint`.

## What's in the demo

- **Role directory** — filterable/searchable table of roles with type (Product/System), source (Default/Custom), permission coverage, status, and assignee counts.
- **Create / edit / duplicate** — an inline form with a `Product → Module → Action` permission tree supporting `specific` and "all except" (select-all-then-exclude) modes.
- **Detail drawer** — overview, full permission breakdown, and an audit timeline; read-only for System Default templates (with "Duplicate to customize").
- **Guards** — can't hard-delete an assigned role (archive instead), last-admin protection, draft-vs-publish gating.
- **Persona switcher** (header) — flip between **TBC Platform Admin** and **Tenant Admin** to see governance visibility, read-only templates, and tenant rules change live.
- **Reset demo data** — clears `localStorage` back to the seed set.

## Stack

Vite + React 19 + TypeScript, with shadcn/ui initialized for future modules. The Role & Permission module is a pixel-faithful port of a bespoke design system (`src/styles/`), not shadcn components.

See `CLAUDE.md` for architecture and `DESIGN_Permission_Role_Module.md` for the spec.
