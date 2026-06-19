# UCN section → prototype mapping

How to turn each part of a use-case-narrative into a piece of a clickable code prototype.
The goal is a flow you can walk end to end with mock state — behavioral fidelity, not
pixel fidelity. When a mapping is ambiguous, ask the user rather than inventing behavior.

## Section → prototype element

| UCN section | Becomes in the prototype |
|---|---|
| `Primary Actor` / `Stakeholders & Interests` | Context only — who you're building for; informs defaults and copy, not structure. |
| `Preconditions` | The initial mock state the prototype boots into (seeded data, flags, permissions). |
| `Trigger` | The entry point into the flow — the route/screen it opens on and what navigates there. |
| `Main Success Scenario` (each step that shows a distinct screen) | A route / view. Steps that are pure system actions become transitions or effects, not new screens. |
| Transitions between steps | Navigation (router push, screen swap) and the controls that cause them. |
| `Extensions` (e.g. `5a`) | Conditional UI attached to the screen of the parent step (step 5): alternate states, error states, modals/sheets, branch destinations. |
| `Business Rules` | Client-side logic: validation, required fields, enable/disable, gating, authorization prompts. |
| `Postconditions` | The mock state changes each outcome commits; the end screen/state of each path. |
| `Technical Notes` (if present) | Reuse its route mapping and store/state hints instead of re-deriving them. |

## Procedure

1. **List the screens.** Walk the Main Success Scenario and pull out each step that puts a
   distinct screen in front of the actor. Those are your routes. Steps that are purely
   "the system does X" become transitions, effects, or state updates between screens.
2. **Wire the happy path.** Connect the screens in order, starting from the Trigger's entry
   point and ending at a success Postcondition. This is the spine you must be able to click
   straight through.
3. **Attach the extensions.** For each Extension, attach its alternate/error/branch UI to
   the screen of its parent step (using the `Na` numbering). Implement the ones that matter
   to the flow — branch destinations, error states, and gated actions — not just cosmetic
   ones. Each branch should reach its own end state.
4. **Encode the business rules.** Turn each rule into enforced behavior: required choices
   block progress, gated actions prompt for authorization, "never default" means no
   pre-selected option, etc. The rule is enforced in the UI, not just described.
5. **Model the state.** Build the minimal mock state (in-memory / local) the flow needs —
   seeded from Preconditions, mutated by steps, settled by Postconditions. No backend; the
   prototype is self-contained.
6. **Default the UI sensibly, and flag it.** Since the narrative is behavioral, choose clean
   default layouts/components and call out the visual choices you made so they can be
   corrected or replaced (e.g. by `implement-figma-design` if a Figma exists).

## Stack notes

- **Detect first.** If there's an existing project, match its framework, router, styling,
  and component conventions — don't introduce a new stack.
- **Default to React** when there's no host project, and confirm that default with the user
  before scaffolding.
- **Mock everything external.** Network calls, auth, and persistence are stubbed with local
  state so the flow is walkable offline.

## Coverage report (always produce this)

After building, report against the narrative so fidelity is visible:

- Main Success Scenario: which steps are reachable in order → success Postcondition.
- Extensions: which branches/errors/gated actions are triggerable, which are stubbed.
- Business Rules: which are actually enforced.
- Assumptions: every visual or data assumption you made that the narrative didn't specify.
