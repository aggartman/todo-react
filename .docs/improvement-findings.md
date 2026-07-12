# Improvement Findings

Punch list of things to fix, tweak, or add to make this a fully functioning todo task app. This doc will be updated as the app evolves — check items off or remove them as they're addressed, and add new ones as they're found.

Each open item carries a **Skills** note: the concepts that item actually teaches. This project is a learning vehicle, so the skill payoff is a legitimate reason to pick one item over another, independent of how "important" the item is to the app.

_Last reviewed: 2026-07-12_

## Bugs / correctness

- [x] `toggleTodo` (`src/App.js`) mutates the found todo object in place (`todo.complete = !todo.complete`) before setting a shallow-copied array. Works today but breaks if we rely on immutability later (e.g. `React.memo`). Replace with a `.map()` that returns new objects.
- [x] `handleAddTodo` (`src/App.js`) doesn't `.trim()` the input, so a string of only spaces gets added as a "blank" todo.
- [x] `todoNameRef.current.value = null` (`src/App.js`) should be `''` — setting an input's value to `null` works but is a smell.
- [x] `JSON.parse(localStorage.getItem(...))` (`src/App.js`) has no try/catch — corrupted or missing localStorage data throws on load.
- [x] **Load-in-effect writes an empty array to localStorage on first paint.** `App.js` reads storage in a mount `useEffect` and calls `setTodos`, which schedules a _second_ render. But the write effect also runs on that first render, when `todos` is still the initial `[]` — so `[]` gets persisted before the real data lands. The re-render immediately overwrites it, so nothing visibly breaks, but the sequence is wrong. Fix: seed the state directly with a lazy initializer — `useState(() => readTodosFromStorage())` — and delete the load effect entirely.
  - _Skills: when **not** to reach for `useEffect` (deriving/initializing state is not a side effect); lazy initial state and why `useState(expensiveCall())` differs from `useState(() => expensiveCall())`; reasoning about React's render → commit → effect ordering._

## Missing core functionality

- [x] No delete button for individual todos (only bulk "Clear Complete").
- [x] No edit-in-place for a todo's text.
- [x] No "Add" on Enter key press — must click the button.
- [x] No "select/complete all" toggle.
- [ ] No duplicate-todo check (optional, but common ask).
  - _Skills: input validation placement (block on submit vs. warn inline); deciding what belongs in state vs. what can be derived from it._

## UX / polish

- [x] Zero styling on the todo list/items — `App.css` is empty; needs actual layout (list items, checkbox alignment, strikethrough on complete, spacing).
  - _Skills: CSS layout with flexbox/grid; scoping styles to components; the CSS-modules vs. plain-stylesheet vs. CSS-in-JS tradeoff._
  - _Done: `ui-styling` branch, merged to `main` 2026-07-11. ~260 lines in `App.css` covering layout, the add-todo row, buttons, the todo grid, and the modal._
- [x] No visual distinction (e.g., strikethrough/greyed text) for completed items.
  - _Skills: driving CSS from state via conditional `className`; keeping visual state out of JS state._
  - _Done differently than proposed: instead of strikethrough on the item, `App` now splits `todos` into `activeTodos` / `completeTodos` and renders completed ones under a separate "Completed" heading. Solves the "know at a glance what's done" problem by **separation** rather than by styling. Note the consequence: `Todo` still has no `complete`-conditional className, so if a per-item treatment is ever wanted, that work hasn't been done._
- [ ] **The disabled Add button has no disabled styling.** `App.css` has `.addTodoButton` and `.addTodoButton:hover` but no `:disabled` rule, so with an empty input the button is genuinely disabled while still looking fully enabled — and it still lights up on hover. A control that looks clickable and isn't is worse than no disabled state at all. Needs `.addTodoButton:disabled { … }` and the hover rule narrowed to exclude it (`:hover:not(:disabled)`).
  - _Skills: styling from element state with pseudo-classes rather than JS-toggled classes; **the real lesson — this bug was created by the merge itself.** `ui-styling` was written against a world with no disabled button; the controlled-input branch was written against a world with no CSS. Git resolved the conflict cleanly and still produced an incoherent result. "It compiles" is not verification._
- [ ] No empty-state message when the list has zero todos.
  - _Skills: conditional rendering patterns (`&&` vs. ternary vs. early return) and the classic `0 &&` footgun in JSX._
- [ ] No input placeholder text. (Focus state is now covered — `App.css` has `.todoInput:focus`. Worth revisiting whether `:focus-visible` is the better choice there.)
  - _Skills: form affordances; `:focus-visible` and why it usually beats `:focus`._
- [ ] No responsive/mobile layout — there is not a single `@media` query in `App.css` or `index.css`.
  - _Skills: media queries, mobile-first CSS, fluid sizing._

## Structure / code quality

- [x] **The add-todo input is uncontrolled while the edit-modal input is controlled.** `App.js` drives the new-todo field with a ref (`todoNameRef`) — the DOM owns the value and we reach in to read and clear it. `EditTodoModal.js` uses `useState` — React owns the value. Both work, but the inconsistency is accidental, and the ref approach is what forces awkward code like manually assigning `.current.value = ''`. Convert the add input to controlled state.
  - _Skills: **controlled vs. uncontrolled components** — the single most load-bearing form concept in React; what refs are actually for (imperative DOM escape hatches, not state); why controlled inputs make validation and derived UI trivial._
  - _Done: `name` state + `value`/`onChange`, ref deleted. Also wrapped the input and button in a real `<form onSubmit>` — Enter-to-submit now comes from the browser, so the hand-rolled Enter branch in `handleKeyDown` is gone (Escape stays). Added `disabled={name.trim() === ''}` on the submit button, which is the concrete payoff: derived-from-input UI is trivial when React owns the value and near-impossible when the DOM does. `App` now touches the DOM nowhere._
- [x] All six `setTodos` calls now use the functional `setTodos(prev => ...)` form — no updater reads `todos` from the closure. Side effect of the cleanup above; it also means the updaters are already pure functions of previous state, which makes the `useReducer` item below mostly mechanical.
- [x] Extract localStorage read/write into a small `useLocalStorage` custom hook — currently duplicated logic in two `useEffect`s in `App.js`. (Do this _after_ the lazy-initializer fix above; the hook should encapsulate both the seed-from-storage and the persist-on-change halves.)
  - _Skills: authoring **custom hooks**; recognizing that a hook is just a function that composes other hooks; designing a hook API that mirrors `useState`'s `[value, setValue]` shape._
  - _Done: `src/hooks/useLocalStorage.js`. Generic `(key, defaultValue, validate)` signature — the array-shape knowledge stays in `App` as an `Array.isArray` argument rather than being baked into the hook. Owns the lazy initializer, the parse/shape guards, the corrupt-key cleanup, and the persist effect. `App.js` no longer imports `useEffect` or references localStorage at all. Verified by hand: refresh restores todos; both malformed JSON and valid-JSON-wrong-shape fall back to an empty list without crashing._
- [ ] **The add-todo input's state lives in `App`, so every keystroke re-renders the whole todo list.** Introduced deliberately by the controlled-input change above — the ref version caused zero re-renders while typing. Harmless at this size and _not_ worth a `React.memo` band-aid. The real fix is to colocate: extract an `AddTodoForm` component that owns its own `name` state and takes an `onAdd(name)` prop, so typing only re-renders the form.
  - _Skills: **colocating state as low as it can go** — the actual first-line answer to re-render pressure, before memoization; using React DevTools' "highlight updates when components render" to see the problem instead of guessing at it; understanding why `React.memo`/`useCallback` are usually treating a symptom._
- [ ] **`TodoList` renders `<div>`s — still no list semantics.** Since the `ui-styling` merge it wraps the items in `<div className="todoGrid">` and each `Todo` is a `<div className="todo">`. Screen readers still get no "list, 5 items" announcement. Should be a `<ul>` with `<li>` children. Note the merge made this slightly _more_ expensive to fix: `App.css` now has layout rules keyed to that div structure, so changing the elements means checking the CSS too (browsers apply default `list-style`/padding to `ul`, which will need resetting).
  - _Skills: semantic HTML and its accessibility payoff; what a component is allowed to return (arrays, fragments, `null`); how presentational markup quietly calcifies — the longer a div-soup structure has CSS hanging off it, the more it costs to make semantic._
- [ ] **`toggleTodo` / `editTodo` / `removeTodo` are prop-drilled `App` → `TodoList` → `Todo`.** `TodoList` doesn't use any of them; it only forwards them. That's tolerable at this depth but is the textbook motivation for `useReducer` (consolidate the five `setTodos` calls into one reducer) and, if drilling gets worse, Context.
  - _Skills: the **reducer pattern** (`useReducer`, actions, pure reducers) — a very natural fit if you're used to structured, transactional server-side logic; **Context** and, just as importantly, when Context is the *wrong* answer; recognizing prop drilling as a smell rather than reflexively fixing it._
- [ ] No filter view (All / Active / Completed) — common baseline todo-app feature. Partially pre-empted by the `ui-styling` merge: `App` already derives `activeTodos` and `completeTodos` during render and shows both sections at once. A filter view would mean choosing _which_ section to show rather than computing it — so the derivation work is done and only the selected-filter state is missing. Worth deciding whether the always-both layout is actually better than a filter before building one.
  - _Skills: **derived state** — the filtered list should be computed during render, not stored in its own `useState` (the merge already does this correctly); `useMemo` and when it's actually warranted vs. cargo-culted; noticing when a feature request has been overtaken by a design change._
- [ ] No `id`/`htmlFor` pairing between checkbox and label. (Nesting the `<input>` inside the `<label>` is in fact valid and accessible, so this may be a non-issue — worth verifying with a screen reader or axe rather than changing on instinct.)
  - _Skills: reading the accessibility spec instead of guessing; using axe DevTools / Lighthouse to verify a11y claims._

## Full-stack gap

- [ ] **There is no back end.** `localStorage` is the entire persistence layer, which means no multi-device sync, no sharing, no server-side validation, and no real data model. If full-stack skill is the goal, this is the frontier — everything above is front-end craft, and this is the part that isn't.
  - _Skills: REST/HTTP API design; a Node/Express (or serverless) service; **async state in React** — loading, error, and empty states as first-class UI; `fetch` inside effects and why that's the one place effects genuinely belong; race conditions and cleanup/abort on unmount; optimistic updates and rollback; eventually, why people reach for TanStack Query instead of hand-rolling all of this._
- [ ] No real data model beyond `{ id, name, complete }` — no due dates, priorities, tags, or ordering.
  - _Skills: schema design; migrating persisted data whose shape has changed (a genuine problem the moment a back end exists)._

## Testing / tooling

- [ ] No tests written yet (Testing Library is installed but unused).
  - _Skills: **testing user-visible behavior rather than implementation** — the core Testing Library philosophy; querying by accessible role/label (which is why the a11y items above pay off twice); `userEvent` for realistic interaction; deciding what's worth testing at all._
- [ ] `react-scripts`/CRA is in maintenance mode — not urgent, but worth knowing if the app grows; a Vite migration would be a bigger, separate decision.
  - _Skills: modern JS build tooling (bundling, dev server, HMR, ES modules); understanding what a toolchain actually does instead of treating it as magic; executing a migration without breaking the app._
