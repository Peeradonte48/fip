# FigJam sitemap primitive → spec section mapping

How to read the parts of a FigJam sitemap / site-structure diagram and turn each into the
right product-spec section. `get_figjam` gives you the node tree (the decider);
`get_screenshot` is the visual cross-check. When a primitive is ambiguous, ask the user —
do not invent.

## Diagram primitives you'll encounter

| FigJam primitive | Typical meaning | Maps to |
|---|---|---|
| Root / home node (top of the tree, a box with only outgoing/child links) | The product's entry point | The entry page + the top of the **Sitemap** tree |
| Page card / box (rectangle naming a page or screen) | A page/screen in the product | One **page entry** (route, purpose, content, actions, nav) |
| Nested card / tree child | A page that lives under another | A **sub-page** (child route) under its parent in the tree |
| Parent-child connector / branch line | Hierarchy ("this lives under that") | A **hierarchy edge** in the sitemap tree |
| Cross-link connector / arrow between non-parent pages | A navigation link between pages | A **navigation edge** in the Navigation Model; its label is the link relationship |
| Section / colored region / frame title | A grouping of related pages | A **feature area / module** that groups the pages under it |
| Sticky note / callout / comment | An annotation, rule, or caveat | A **per-page note**, or a **business / access rule** for the nearby page |
| Lane / role label | Who can reach the pages in that lane | **Access / user role** on the affected pages |
| Badge / tag on a card (e.g. "auth", "admin", "modal") | A property of that page | A note on the page entry (access, type) — confirm meaning if unclear |

## Procedure

1. **Find the root.** The node at the top of the tree with children and no parent is usually
   the home/entry page. If several candidates exist, ask which one is the entry point.
2. **Walk the tree to build the hierarchy.** From the root, follow parent-child connectors /
   nesting to assemble the page hierarchy. Render it as the **Sitemap** tree (indented list).
3. **One node = one page entry.** For each page, capture what the board grounds: name,
   route (ask if absent), purpose, key content/sections, primary actions, and its links.
4. **Connectors = navigation edges.** Cross-links between pages become the **Navigation
   Model**; use a connector's label as the link relationship. Parent-child lines are
   hierarchy, not necessarily nav — distinguish the two.
5. **Groupings = modules.** Sections / colored regions become **feature areas**; list which
   pages belong to each. They may also hint at the product name or scope.
6. **Annotations = notes/rules.** Sticky notes that state constraints ("login required",
   "admin only") become **business / access rules** on the affected page. Stickies that
   merely re-describe a page fold into that page's notes instead.
7. **Roles from lanes.** Lane / role labels tell you who reaches which pages; collect them
   into **User Roles & Access**. Roles beyond what the board shows — ask, don't invent.

## What sitemaps routinely omit (so: ask)

- **Routes / URL paths** — a box says "Settings", not `/settings`. Ask for the route, or
  record it as an open question.
- **Page purpose** — a name isn't a purpose. Ask what the page is *for* if it isn't on the
  board.
- **Data behind each page** — sitemaps show pages, not entities. Ask before inventing a data
  model.
- **Access control / roles** — unless lanes or badges say so, you don't know who sees what.
  Ask.
- **The home / entry node** — if more than one box could be the root, ask which begins the
  product.
- **Product name / scope** — if the board doesn't title the product or bound its scope, ask.
