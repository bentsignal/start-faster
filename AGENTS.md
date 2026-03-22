# AGENTS.md

Guidance for coding agents working in `/Users/shawn/dev/projects/start-faster`.

## Repository Summary

- Turborepo monorepo.
- This project is very early on, proposing sweeping changes that improve long-term maintainability is encouraged.

## Core Priorities

1. Performance first.
2. Reliability first.
3. Keep behavior predictable under load and during failures (session restarts, reconnects, partial streams).

If a tradeoff is required, choose correctness and robustness over short-term convenience.

## Required Validation After Changes

At the end of every run, run the following commands in order:

1. `pnpm run lint`
2. `pnpm run typecheck`

If both of these succeed, run:

3. `pnpm run format:fix`

Then summarize changes for the user.

## Maintainability

Long term maintainability is a core priority. If you add new functionality, first check if there is shared logic that can be extracted to a separate module. Duplicate logic across multiple files is a code smell and should be avoided. Don't be afraid to change existing code. Don't take shortcuts by just adding local logic to solve a problem.

## Testing

Currently no testing solution is in place so don't worry about writing tests right now.

## Custom Components

- When navigating between pages internally, use the `QuickLink` component from `@acme/features/quick-link`. Its API is nearly identical to that of the official TanStack Router `Link` component, it just has some optimizations added on top.
- When creating an image in an app, use the app's `~/components/image` wrapper. Each web app exposes one, and it is backed by the shared optimized image implementation rather than a raw `<img>`.
