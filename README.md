# Agent Quiz App

A small quiz app for testing your grasp of AI development concepts — agent
fundamentals, prompt engineering, model selection.

**The app is not the point. How it was built is.**

Every feature in `app/` was written by Claude Code running unattended in a loop.
I wrote the PRD, split it into issues, and started the loop. The agent picked
each issue, built it test-first, ran the feedback loops, committed, and closed
the issue — then picked the next one. Nine commits, one afternoon, 78 passing
tests.

This repo is the loop, the prompt and the skills that made that work. The quiz
app is what fell out of it.

## The loop

[`ralph/afk.sh`](ralph/afk.sh) — a "Ralph loop": the same prompt, fired at a
fresh agent over and over, where the repo itself carries the state between runs.

```bash
./ralph/afk.sh 10    # up to 10 unattended iterations
./ralph/once.sh      # a single interactive pass
```

Each iteration assembles three things and hands them to a fresh Claude Code
session running in a Docker sandbox:

| Input | Why |
|---|---|
| `gh issue list --state open` (with bodies and comments) | the backlog — what's left to do |
| `git log -n 5` (full messages) | what the last few iterations already did |
| [`ralph/prompt.md`](ralph/prompt.md) | the standing instructions |

There is no memory between iterations. **The issue tracker and the commit log
are the memory** — which is why the prompt requires commit messages to record
decisions and blockers, and requires the agent to comment on an issue it could
not finish. A run that skips that step blinds the next one.

The loop exits when the agent emits `<promise>NO MORE TASKS</promise>`, or when
it hits the iteration cap.

## The prompt

[`ralph/prompt.md`](ralph/prompt.md) is the whole specification of the agent's
behaviour. The parts that do the work:

- **One task per iteration.** The last line of the prompt, in capitals. Without
  it an agent will half-finish four things and commit none of them.
- **AFK vs HITL.** Issues are tagged by whether they need a human. The
  unattended loop is only allowed to touch the AFK ones — anything needing my
  judgement waits for me.
- **A fixed priority order** — critical bugfixes, then dev infrastructure, then
  tracer bullets, then polish, then refactors. Infrastructure outranks features
  deliberately: tests and types are what let the *next* iteration move safely.
- **Tracer bullets.** Build one thin end-to-end slice first, then widen it.
- **Red/green/refactor**, one test at a time, for logic. Direct implementation
  plus a smoke test for pure UI — an agent writing tests for presentational
  markup produces noise.
- **Feedback loops before committing** — `pnpm test` and `pnpm typecheck`. This
  is the gate that makes unattended runs survivable: the agent cannot commit
  work it hasn't proven.

## The skills

[`.claude/skills/`](.claude/skills/) holds the human-side half of the pipeline —
the steps that happen *before* the loop is allowed to run:

| Skill | Role |
|---|---|
| [`write-a-prd`](.claude/skills/write-a-prd/SKILL.md) | Interrogates me about the idea, then writes the PRD |
| [`prd-to-issue`](.claude/skills/prd-to-issue/SKILL.md) | Splits the PRD into independently-grabbable issues as vertical slices |
| [`do-work`](.claude/skills/do-work/SKILL.md) | Plan, implement, typecheck, test, commit |
| [`qa`](.claude/skills/qa/SKILL.md) | Conversational bug reporting that files real issues in the project's own language |
| [`grill-me`](.claude/skills/grill-me/SKILL.md) | Stress-tests a plan one question at a time before anything gets built |
| [`setup-pre-commit`](.claude/skills/setup-pre-commit/SKILL.md) | Husky, lint-staged, typecheck and tests on commit |

The division is the design: **grilling and the PRD are mine, the issues are the
contract, the implementation is the agent's.** The loop is only as good as the
issues it's fed, so the effort goes into the slicing, not the prompting.

The product spec the run worked from is [`docs/project.md`](docs/project.md).

## What got built

Nine commits on a single day, seven of them features closing issues #3–#9:
quiz data module, persistence and user identity, the quiz engine, results,
home and category selection with a learn mode, answer review, and a dashboard.
Final state: **78 tests passing, typecheck clean.**

```bash
cd app
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # vitest
pnpm typecheck
```

## Stack

| | |
|---|---|
| Framework | React 19 + Vite |
| Routing | TanStack Router (file-based) |
| UI | shadcn/ui on Base UI, Tailwind 4 |
| Testing | Vitest, Testing Library, MSW |
| Language | TypeScript |
| Package manager | pnpm |
