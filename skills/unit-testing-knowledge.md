# Unit Testing Knowledge Base

## Purpose
Use unit tests to verify small pieces of app behavior in isolation. In the arenatuner project, that means:
- parser utilities in `src/lib/` should be tested with deterministic sample input
- React components should be tested for rendered output and user behavior
- component tests should avoid implementation details and focus on what the user sees and does

## Vitest Best Practices
- Keep test files next to the source file using `.test.ts`, `.test.tsx`, or `.spec.tsx`.
- Prefer `describe()` groups with `it()` for behavioral specs, e.g. `it('should do thing')`.
- Use `beforeEach()` to consolidate repeated setup steps and share reusable helpers.
- Prefer `vitest` with `happy-dom` for DOM tests in a Vite app.
- Enable `globals: true` if you want to use `describe`, `it`, `expect` without imports.
- Run `pnpm test` or `pnpm vitest run` for CI-friendly execution.
- Use `--passWithNoTests` or `vitest run` so the test command is stable before tests exist.

## React Testing Library Best Practices
- Query by accessible roles and text, not implementation details.
- Use `screen.getByRole()`, `screen.getByLabelText()`, and `screen.findByText()`.
- Use `userEvent` for realistic interactions when needed.
- Avoid testing internal state directly; verify the rendered result.
- Clean up after rendering by default with Testing Library.

## Parser Utility Tests
- Validate the parser using sample deck export text.
- Assert `totalCards`, `deckSlots`, and `unknownCardNames`.
- Cover edge cases: blank lines, invalid lines, suffix formatting, and sideboard sections.
- Keep parser tests fast and deterministic.

## Component Tests
- Render the component with `render(<App />)` or `render(<MyComponent />)`.
- Assert initial zero-state text appears when the form has not been submitted.
- Simulate typing and clicking `Parse deck` to verify updates in the DOM.
- Avoid snapshot tests for complex UI if they add brittleness.

## General Testing Principles
- Write small, targeted tests that fail for one reason.
- Prefer readable assertions over complex logic inside tests.
- Keep tests isolated; avoid network access and shared mutable global state.
- Use test fixtures or helper functions for sample data.
- Create reusable utilities for common input builders, parser factories, or render helpers.
- Use `beforeEach()` to keep repeated setup concise and avoid bloated test bodies.
- Review test output quickly and maintain tests as code changes.
