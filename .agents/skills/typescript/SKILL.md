---
name: TypeScript
description: Guidelines for writing production grade TypeScript.
---

The overarching philosophy is strong type safety through inference. The compiler should do the heavy lifting instead of manual annotation.

## Required loading protocol

Before proposing code, editing files, or running implementation commands, complete this loading flow in order:

1. Enumerate every Markdown file in `rules/`.
2. Read every discovered `.md` file in alphabetical order.
3. Only continue once all rule files have been read.

Do not skip any rule file, even if it seems unrelated. If any rule file is unreadable, stop and ask the user how to proceed.

## Enforcement

All rules are mandatory. If you believe a rule should be broken for this task, pause and confirm with the user before proceeding.
