# Improvement Findings

Punch list of things to fix, tweak, or add to make this a fully functioning todo task app. This doc will be updated as the app evolves — check items off or remove them as they're addressed, and add new ones as they're found.

_Last reviewed: 2026-07-10_

## Bugs / correctness

- [ ] `toggleTodo` (`src/App.js`) mutates the found todo object in place (`todo.complete = !todo.complete`) before setting a shallow-copied array. Works today but breaks if we rely on immutability later (e.g. `React.memo`). Replace with a `.map()` that returns new objects.
- [ ] `handleAddTodo` (`src/App.js`) doesn't `.trim()` the input, so a string of only spaces gets added as a "blank" todo.
- [ ] `todoNameRef.current.value = null` (`src/App.js`) should be `''` — setting an input's value to `null` works but is a smell.
- [ ] `JSON.parse(localStorage.getItem(...))` (`src/App.js`) has no try/catch — corrupted or missing localStorage data throws on load.

## Missing core functionality

- [ ] No delete button for individual todos (only bulk "Clear Complete").
- [ ] No edit-in-place for a todo's text.
- [ ] No "Add" on Enter key press — must click the button.
- [ ] No "select/complete all" toggle.
- [ ] No duplicate-todo check (optional, but common ask).

## UX / polish

- [ ] Zero styling on the todo list/items — `App.css` is empty; needs actual layout (list items, checkbox alignment, strikethrough on complete, spacing).
- [ ] No empty-state message when the list has zero todos.
- [ ] No visual distinction (e.g., strikethrough/greyed text) for completed items.
- [ ] No input placeholder text or focus state.
- [ ] No responsive/mobile layout.

## Structure / code quality

- [ ] Extract localStorage read/write into a small `useLocalStorage` custom hook — currently duplicated logic in two `useEffect`s in `App.js`.
- [ ] No filter view (All / Active / Completed) — common baseline todo-app feature.
- [ ] No `id`/`htmlFor` pairing between checkbox and label (works visually since input is nested in label, but worth confirming accessibility).

## Testing / tooling

- [ ] No tests written yet (Testing Library is installed but unused).
- [ ] `react-scripts`/CRA is in maintenance mode — not urgent, but worth knowing if the app grows; a Vite migration would be a bigger, separate decision.
