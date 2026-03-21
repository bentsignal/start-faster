---
name: Review
description: Code review to improve implementation details, only use when explicitly requested by user.
---

# Review

This skill is for a dedicated cleanup and refactor pass after implementation work already exists. It should be used to turn "working enough" code into code that is robust, maintainable, and aligned with the project's standards.

Do not use this skill unless the user explicitly asks for a review, audit, cleanup pass, refactor pass, or specifically asks you to use the `Review` skill.

## Goal

Use the rules in this skill to audit the currently modified code and then improve it. The target is the active change set, not the entire repository.

The review should answer questions like:

- Does the state management approach fit the feature, or does it need an overhaul?
- Is the component composition clear, small, and well-factored?
- Are data loading and mutations handled in the right place?
- Is the TypeScript robust, inference-friendly, and free of unsafe escape hatches?
- Do the changes follow the project's React and TypeScript rules as a coherent system, not as isolated style nits?

## Required loading protocol

Before proposing review feedback, editing files, or running implementation commands, complete this flow in order:

1. Enumerate every Markdown file in `rules/\*\*/<rule>.md
2. Read every discovered rule file in alphabetical order within each folder.
3. Do not continue until all rule files have been read.
4. Treat every rule as mandatory unless the user explicitly approves an exception.

Do not skip a rule because it seems unrelated at first glance. The purpose of this skill is to understand how the rules work together.

## Review workflow

### 1. Internalize the rules deeply

Do not skim. Read the rules closely enough to understand:

- what each rule is asking for
- why the rule exists
- how the React and TypeScript rules reinforce each other
- which kinds of implementation mistakes the rules are trying to prevent

This step matters because the review is not just about spotting isolated violations. It is about recognizing when the overall shape of the code is wrong.

### 2. Inspect the active changes

Audit the current work by reading the change set first:

- staged changes
- unstaged changes

Prefer reviewing the diff before reading whole files. Then read any touched files and nearby supporting files needed to understand the architecture and intent.

The review target is the code that changed, plus any adjacent code that must also change to make the refactor correct and maintainable.

### 3. Build an audit plan

After reading the rules and the diff, identify the highest-leverage improvements. Focus on structural correctness before minor cleanup.

Prioritize in this order:

1. Incorrect architecture or wrong state-management approach
2. Wrong data-loading or mutation flow
3. Unsafe or brittle TypeScript design
4. Poor component or hook composition
5. Performance issues caused by subscription shape, effects, or render boundaries
6. Smaller cleanup issues

If the right fix requires a broader refactor, do the broader refactor. Do not preserve a poor structure just to keep the patch small.

### 4. Implement the improvements

Make the code changes needed to bring the change set in line with the rules.

This can include:

- moving logic into better files
- splitting large components or hooks apart
- replacing prop drilling with a better state shape
- moving data fetching into route loaders or query builders
- restructuring mutations to be user-driven and colocated properly
- removing unsafe assertions or redundant type annotations
- rewriting control flow so the code becomes easier to verify

Prefer durable fixes over cosmetic edits. If several files need to change together to make the design coherent, change them together.

### 5. Keep the review scoped and practical

Do not turn the pass into an unrelated repo-wide cleanup. Improve what is necessary to make the reviewed change set solid.

Good review work is:

- strongly opinionated about correctness and maintainability
- willing to refactor when needed
- not distracted by trivia

### 6. Validate the result

After making changes, run the repository validation steps required by the project instructions.

### 7. Report what changed

Summarize:

- the main architectural or design problems you found
- the improvements you made
- any rule-driven tradeoffs or exceptions that still remain

## Enforcement

All rules under `rules/react/` and `rules/typescript/` are mandatory during the review pass.

If you believe a rule should be broken for a specific task, stop and confirm with the user before doing so.
