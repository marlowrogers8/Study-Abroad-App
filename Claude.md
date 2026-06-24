# Project Context for Claude Code

## Team
Two founders working in parallel, each on our own machine, each running Claude Code independently. We are not pair-programming in a shared terminal — we work on separate branches and sync through GitHub.

## Stack
TBD — not yet decided. Update this section as soon as the stack is chosen (framework, language, package manager, database, etc.) so future Claude Code sessions have accurate context.

## Workflow rules (always follow these)
1. **Pull before starting work.** Always run `git pull origin main` before creating a branch or starting a new task.
2. **Never commit directly to `main`.** Always create a feature branch first: `git checkout -b feature/short-description`.
3. **Push in small, frequent chunks** (not one giant commit at the end of a session). Aim for every 15–30 minutes of active work, or after each logical chunk of functionality.
4. **Pull before you push.** If the other founder has pushed changes since you last pulled, run `git pull` (rebase if possible) before pushing your own work, to catch conflicts early.
5. **Open a PR instead of merging directly**, even though it's just the two of us — this keeps a clear record of what changed and why.
6. **Write clear commit messages** — short summary of what changed and why, not just "updates" or "fix."

## Coordination
Before starting a session, briefly confirm out loud / over text who is working on which part of the codebase (e.g. "I've got the API routes, you take the frontend form") to avoid both of us editing the same files at the same time.

## Conventions
TBD — add naming conventions, folder structure, and style preferences here once established.

## Notes
- Both founders are running Claude Code locally via SSH into our own respective machines.
- Keep this file updated as the project evolves — it's the shared source of truth both our Claude Code sessions read from.
