# Improvement Findings

Punch list of things to fix, tweak, or add to make this a fully functioning todo task app. This doc will be updated as the app evolves — check items off or remove them as they're addressed, and add new ones as they're found.

Each open item carries a **Skills** note: the concepts that item actually teaches. This project is a learning vehicle, so the skill payoff is a legitimate reason to pick one item over another, independent of how "important" the item is to the app.

_Last reviewed: 2026-07-11_

## Bugs / correctness

- [x] `toggleTodo` (`src/App.js`) mutates the found todo object in place (`todo.complete = !todo.complete`) before setting a shallow-copied array. Works today but breaks if we rely on immutability later (e.g. `React.memo`). Replace with a `.map()` that returns new objects.
- [x] `handleAddTodo` (`src/App.js`) doesn't `.trim()` the input, so a string of only spaces gets added as a "blank" todo.
- [x] `todoNameRef.current.value = null` (`src/App.js`) should be `''` — setting an input's value to `null` works but is a smell.
- [x] `JSON.parse(localStorage.getItem(...))` (`src/App.js`) has no try/catch — corrupted or missing localStorage data throws on load.
- [ ] **Load-in-effect writes an empty array to localStorage on first paint.** `App.js` reads storage in a mount `useEffect` and calls `setTodos`, which schedules a *second* render. But the write effect also runs on that first render, when `todos` is still the initial `[]` — so `[]` gets persisted before the real data lands. The re-render immediately overwrites it, so nothing visibly breaks, but the sequence is wrong. Fix: seed the state directly with a lazy initializer — `useState(() => readTodosFromStorage())` — and delete the load effect entirely.
  - _Skills: when **not** to reach for `useEffect` (deriving/initializing state is not a side effect); lazy initial state and why `useState(expensiveCall())` differs from `useState(() => expensiveCall())`; reasoning about React's render → commit → effect ordering._

## Missing core functionality

- [x] No delete button for individual todos (only bulk "Clear Complete").
- [x] No edit-in-place for a todo's text.
- [x] No "Add" on Enter key press — must click the button.
- [x] No "select/complete all" toggle.
- [ ] No duplicate-todo check (optional, but common ask).
  - _Skills: input validation placement (block on submit vs. warn inline); deciding what belongs in state vs. what can be derived from it._

## UX / polish

- [ ] Zero styling on the todo list/items — `App.css` is empty; needs actual layout (list items, checkbox alignment, strikethrough on complete, spacing).
  - _Skills: CSS layout with flexbox/grid; scoping styles to components; the CSS-modules vs. plain-stylesheet vs. CSS-in-JS tradeoff._
- [ ] No empty-state message when the list has zero todos.
  - _Skills: conditional rendering patterns (`&&` vs. ternary vs. early return) and the classic `0 &&` footgun in JSX._
- [ ] No visual distinction (e.g., strikethrough/greyed text) for completed items.
  - _Skills: driving CSS from state via conditional `className`; keeping visual state out of JS state._
- [ ] No input placeholder text or focus state.
  - _Skills: form affordances; `:focus-visible` and why it beats `:focus`._
- [ ] No responsive/mobile layout.
  - _Skills: media queries, mobile-first CSS, fluid sizing._

## Structure / code quality

- [ ] **The add-todo input is uncontrolled while the edit-modal input is controlled.** `App.js` drives the new-todo field with a ref (`todoNameRef`) — the DOM owns the value and we reach in to read and clear it. `EditTodoModal.js` uses `useState` — React owns the value. Both work, but the inconsistency is accidental, and the ref approach is what forces awkward code like manually assigning `.current.value = ''`. Convert the add input to controlled state.
  - _Skills: **controlled vs. uncontrolled components** — the single most load-bearing form concept in React; what refs are actually for (imperative DOM escape hatches, not state); why controlled inputs make validation and derived UI trivial._
- [ ] Extract localStorage read/write into a small `useLocalStorage` custom hook — currently duplicated logic in two `useEffect`s in `App.js`. (Do this *after* the lazy-initializer fix above; the hook should encapsulate both the seed-from-storage and the persist-on-change halves.)
  - _Skills: authoring **custom hooks**; recognizing that a hook is just a function that composes other hooks; designing a hook API that mirrors `useState`'s `[value, setValue]` shape._
- [ ] **`TodoList` renders a bare array of `<div>`s — no list semantics.** The component returns `todos.map(...)` directly with no wrapping element, and each `Todo` renders a `<div>`. Screen readers get no "list, 5 items" announcement. Should be a `<ul>` with `<li>` children.
  - _Skills: semantic HTML and its accessibility payoff; what a component is allowed to return (arrays, fragments, `null`); when a Fragment (`<>`) is the right wrapper and when a real element is._
- [ ] **`toggleTodo` / `editTodo` / `removeTodo` are prop-drilled `App` → `TodoList` → `Todo`.** `TodoList` doesn't use any of them; it only forwards them. That's tolerable at this depth but is the textbook motivation for `useReducer` (consolidate the five `setTodos` calls into one reducer) and, if drilling gets worse, Context.
  - _Skills: the **reducer pattern** (`useReducer`, actions, pure reducers) — a very natural fit if you're used to structured, transactional server-side logic; **Context** and, just as importantly, when Context is the *wrong* answer; recognizing prop drilling as a smell rather than reflexively fixing it._
- [ ] No filter view (All / Active / Completed) — common baseline todo-app feature.
  - _Skills: **derived state** — the filtered list should be computed during render, not stored in its own `useState`; `useMemo` and when it's actually warranted vs. cargo-culted._
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
