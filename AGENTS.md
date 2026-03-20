# AGENTS.md

Guidance for coding agents working in `/Users/shawn/dev/projects/start-faster`.

## Repository Summary

- Turborepo monorepo.
- Greenfield project, prefer ambitious overhauls when necessary to lay solid foundation. Rip out unused code when possible.

## Preparation

Before you begin, you should read through any skills that may help you complete your task. Since this project uses both TypeScript and React heavily, it's usually a good idea to utilize those skills.

**_Important_** Make sure that you internalize the information you gain from the skills to gain a deep understanding of their intent.

## Required Validation After Changes

At the end of every run, run the following commands in order:

1. `pnpm run lint`
2. `pnpm run typecheck`

If both of these succeed, run:

3. `pnpm run format:fix`

Then summarize changes for the user. Currently no testing solution is in place so don't worry about tests for now.
