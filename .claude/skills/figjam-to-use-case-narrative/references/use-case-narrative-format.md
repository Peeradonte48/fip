# Use-Case Narrative (UCN) — format contract

This is the canonical structure for a use-case-narrative document. It is the **shared
contract** between `figjam-to-use-case-narrative` (which emits it) and
`use-case-narrative-to-prototype` (which consumes it). An identical copy lives in both
skills — if you change one, change the other.

A UCN describes a single user flow precisely enough to build from: who acts, what must be
true first, what triggers it, the step-by-step happy path, every branch and error, the
resulting state, and the rules that govern it. Steps must be concrete and testable
(an observable actor action paired with the system's response), never vague.

## Required sections, in this order

```markdown
# UC-NN: Title

## Primary Actor
- **Role** — who drives the flow and in what context. List secondary actors who may also
  perform it (with the same or different permissions).

## Stakeholders & Interests
- **Role** — what this party wants from the flow and why. Cover everyone with a stake
  (the end user, the operator, downstream systems/teams, the business), not just the actor.

## Preconditions
- What must already be true before the flow can start (state, prior flows completed,
  data present, permissions held).

## Trigger
- The single event that starts the flow (a tap, a navigation, an external signal).

## Main Success Scenario
1. Numbered steps of the happy path, in order. Each step = an actor action and the
   system's response. Be specific about what's on screen, what's enabled/disabled, and
   what data moves. Aim for the natural granularity of the flow (often ~8–15 steps).
2. ...

## Extensions
- **2a. Condition:** behavior and outcome of a branch or error off step 2.
- **5a. Condition:** ... (number each extension to the Main Success Scenario step it
  branches from; a step can have several: 5a, 5b, 5c.)

## Postconditions
**On success:**
- The state changes that hold once the flow completes successfully.

**On exit / failure:**
- The state when the user abandons or the flow fails (often: nothing committed).

## Business Rules
- Domain constraints and invariants, each with its rationale ("always X", "never Y",
  "Z requires authorization"). These are the rules the UI must enforce, distinct from the
  steps that happen to exercise them.
```

## Optional section

```markdown
## Technical Notes
- **Stores touched / state:** which data stores or state slices the flow reads/writes.
- **Related code:** routes, pages, components the flow maps to.
- **Route mapping:** the screen ↔ route correspondence.
```

Include `Technical Notes` **only** when there is real codebase context to record. When the
narrative is derived from a diagram or written from scratch with no code to point at, omit
this section rather than inventing it.

## Conventions

- **Section order is fixed.** Keep the required sections in the order above. Omit only the
  optional `Technical Notes`.
- **Numbering links Extensions to steps.** `5a` is a branch off Main step 5. This linkage
  is load-bearing — downstream tooling uses it to attach alternate states to the right
  screen.
- **Bilingual labels are optional.** If the source uses two languages for UI labels (e.g.
  Thai/English), mirror that. Otherwise write in one language. Don't add a second language
  that isn't in the source.
- **Postconditions split by outcome.** At minimum a success outcome and an exit/failure
  outcome; add more outcome headings if the flow has them.
- **Title format:** `# UC-NN: Short imperative title` (e.g. `# UC-04: Take a Dine-In
  Order`). If no UC number is known, ask for one rather than guessing the sequence.
