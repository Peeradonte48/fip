# FigJam primitive → UCN section mapping

How to read the parts of a FigJam flow diagram and turn each into the right
use-case-narrative section. `get_figjam` gives you the node tree (the decider);
`get_screenshot` is the visual cross-check. When a primitive is ambiguous, ask the user —
do not invent.

## Diagram primitives you'll encounter

| FigJam primitive | Typical meaning | Maps to |
|---|---|---|
| Start node (rounded "Start", a lone source with only outgoing arrows) | Where the flow begins | `Trigger` |
| Process box / card (rectangle with an action verb) | A step the actor or system performs | A numbered step in `Main Success Scenario` |
| Screen mock / frame card | A distinct screen in the flow | A numbered step (note it shows a new screen) |
| Decision diamond (or any node with 2+ labeled outgoing arrows) | A branch point | The split between the main path and one or more `Extensions` |
| Connector / arrow | Ordered transition; its label is the condition | Sequence of steps; labels become Extension conditions |
| Terminal / end node ("End", "Done", a sink with only incoming arrows) | An outcome state | A `Postconditions` outcome |
| Sticky note / callout / comment | An annotation, rule, or caveat | `Business Rules` (if it states a rule) or clarification of a nearby step |
| Swimlane / lane label | Who performs the steps in that lane | `Primary Actor` / which actor owns each step |
| Section / colored region title | A phase or grouping of the flow | Narrative grouping; may hint at the Title or sub-flows |

## Procedure

1. **Find the start.** The node with outgoing arrows and no incoming arrow is usually the
   trigger. If several candidates exist, ask which one begins the flow.
2. **Walk the main path.** From the start, follow the connectors that represent the
   intended happy path (often the straightest/unlabeled "yes/default" arrows). Each node
   along it becomes a numbered Main Success Scenario step, in order.
3. **Peel off branches as Extensions.** At every decision node or wherever a connector
   leaves the main path, capture the branch as an Extension numbered to the main step it
   leaves from (a branch after step 5 → `5a`, the next → `5b`). Use the connector's label
   as the Extension's condition. Follow each branch to its own end state.
4. **Collect end states into Postconditions.** Group terminal nodes by outcome — success
   sinks under **On success**, abandon/error sinks under **On exit / failure**.
5. **Read annotations as rules.** Sticky notes that state constraints ("required", "never
   default", "manager approval needed") become `Business Rules` with their rationale.
   Sticky notes that merely re-describe a step fold into that step instead.
6. **Assign actors from lanes.** Swimlane labels tell you who performs each step; the lane
   of the start node usually names the `Primary Actor`. Stakeholders beyond the actor are
   rarely on the board — ask for their interests rather than inventing them.

## What diagrams routinely omit (so: ask)

- **Preconditions** — diagrams show the flow, not the world before it. Ask what must be
  true to start.
- **Stakeholder interests** — lanes name actors but not *why they care*. Ask.
- **Business-rule rationale** — a sticky may say "PIN required" without saying why. Ask
  for the reason if it isn't on the board.
- **Unlabeled branch conditions** — if a decision's arrows aren't labeled, you can't know
  which is which. Ask.
- **The UC number / ordering** — unless the board numbers its flows, ask how this one is
  numbered relative to the others.
