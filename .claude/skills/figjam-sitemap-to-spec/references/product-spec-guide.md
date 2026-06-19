# Product spec — authoring guide (flexible, not a template)

This guide describes the building blocks a good product spec usually covers when it's
derived from a sitemap. It is **guidance, not a rigid template**: include the blocks the
sitemap actually grounds, drop the ones it doesn't, reorder freely, and add blocks the
board calls for. The section *set and order* are your call per sitemap — there is no fixed
contract here (unlike the use-case-narrative format, which is strict).

This is the `figjam-sitemap-to-spec` skill's own reference. It is **not** shared with another
skill, so there is no sync obligation.

## Core directives

- **Ground everything.** Every claim should trace to something on the board or to an answer
  the user gave. Prefer **omitting** an ungrounded section over fabricating it.
- **Record gaps, don't paper over them.** Anything the spec needs but the board didn't
  supply goes under **Open Questions & Assumptions** — keep that honest.
- **Always render the structure.** However you adapt the rest, include the sitemap tree and a
  concrete entry per page; that's the spine of the spec.
- **Match the board's language.** Bilingual labels only if the board uses them.

## Building blocks (suggested, not mandated)

- **Overview & Purpose** — what the product is and who it's for, in a few lines.
- **Sitemap** — the page/screen hierarchy as an indented tree / nested list.
- **Pages** — one entry per page. Useful per-page fields, when grounded:
  - **Route** — the URL path (ask if not on the board).
  - **Purpose** — what the page is for.
  - **Key content / sections / components** — what's on it.
  - **Primary actions** — what the user can do there.
  - **Navigation** — links in and out.
  - **Access / roles** — who may reach it (if applicable).
- **Global & Shared Elements** — nav/header/footer, modals, components shared across pages.
- **Navigation Model** — the primary navigation and how pages connect (the cross-links).
- **Data Entities** — entities implied by the pages (ask before inventing a data model).
- **User Roles & Access** — only if lanes/sections/badges imply roles.
- **Open Questions & Assumptions** — everything not grounded on the board.

## Suggested skeleton — adapt, don't follow verbatim

Use this only as a starting shape; cut and reshape it to fit the actual sitemap.

```markdown
# <Product/Area> — Product Spec

## Overview & Purpose
<what it is, who it's for>

## Sitemap
- Home
  - Dashboard
  - Settings
    - Profile
    - Billing

## Pages

### Home
- **Route:** /
- **Purpose:** …
- **Key content:** …
- **Primary actions:** …
- **Navigation:** → Dashboard, → Settings

### Settings
- …

## Global & Shared Elements
- <top nav, footer, shared modals…>

## Navigation Model
- <primary nav; notable cross-links>

## Data Entities
- <entities implied by the pages — only if grounded>

## User Roles & Access
- <roles and which pages they reach — only if the board shows them>

## Open Questions & Assumptions
- <routes not on the board, undefined purposes, unconfirmed roles…>
```
