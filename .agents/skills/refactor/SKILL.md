---
name: Refactor
description: Code refactor to improve implementation details, only use when explicitly requested by user.
---

# Refactor

This skill turns "working enough" code into code that is robust, maintainable, and aligned with the project's standards. It is activated only when the user explicitly asks for a refactor, audit, cleanup pass, or specifically asks you to use the `Refactor` skill.

The target is the active change set, not the entire repository.

Each rule file under `rules/` represents an independent concern (composition, data loading, performance, state management, TypeScript patterns, etc.). Instead of reading every rule yourself and trying to apply them all at once, you delegate to subagents -- one per rule file. Each subagent becomes a deep expert on its single rule and evaluates the current changes entirely through that lens.

## 1. Spawn one subagent per rule file

Enumerate every file under `rules/` and its subfolders. For each rule file, spawn a subagent with the following instructions:

1. **Role:** You are a senior engineer mentoring a junior teammate. You have been given one rule file that describes a coding standard the team has agreed on. Your job is to deeply internalize this rule, study the current changes, and produce a thorough assessment of how the code should be overhauled to fully align with the standard.
2. **Read-only constraint:** Do NOT edit, create, or delete any files. Your only job is to read code, analyze it, and return findings.
3. **Rule file:** Read the rule file at `<absolute path>` carefully and completely before doing anything else.
4. **Getting the diff:** Run `git diff` and `git diff --cached` to see the current change set. Also read the full contents of every changed file so you have complete context, not just the diff hunks.
5. **What to return:** Return a thorough, ambitious assessment. Note small fixes and style nits, but do not limit yourself to them. Look for places where the implementation approach itself is wrong and needs to be overhauled. If the code uses the wrong patterns, the wrong architecture, the wrong abstractions -- recommend ripping out the current approach and replacing it with one that properly aligns with the rule. Partial adjustments are not enough when the foundation is wrong.
   For each finding, include:

- What is wrong with the current approach and why it does not satisfy the rule
- Where the problem is (file path and relevant code)
- What the correct approach looks like -- described in enough detail that someone could implement it without having to re-read the rule
- Why this matters (what breaks, degrades, or becomes unmaintainable if left as-is)
  Prioritize being correct, thorough, and detailed over finishing quickly. Do not hold back.

6. **If no issues are found:** Explicitly state that the current changes already satisfy the rule and no changes are needed.

## 2. Synthesize findings

Once all subagents have returned their findings, consolidate everything they reported. Identify overlaps, dependencies, and conflicts between findings from different rules. Do not leave out any details provided by sub agents.

Present the combined findings to the user as a proposed plan. Ask the user questions about how they want to proceed -- which findings to act on, which to skip, and any tradeoffs between competing concerns.

### Handling conflicts

Different rules will sometimes recommend incompatible approaches for the same code. When this happens, do not resolve the conflict yourself. Present the conflict to the user, explain what each rule is asking for and why they are at odds, and let the user decide. Every conflict is its own question. Do not bundle multiple conflicts into a single question and do not silently pick a side.
