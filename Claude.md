# Project Context for Claude Code

## Team
Two founders working in parallel, each on our own machine, each running Claude Code independently. We are not pair-programming in a shared terminal — we work on separate branches and sync through GitHub.

## Product vision
The main purpose of our website — and how we differentiate from other study abroad sites — is **complete transparency**. We provide actual, authentic reviews from real students instead of paid reviews and funnels that steer users toward specific abroad programs. Other sites monetize by pushing students into particular programs; we don't. Every feature and product decision should reinforce this trust-first, no-pay-to-play principle.

## Stack
- **Framework:** Next.js 15 (App Router) with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (config lives in `src/app/globals.css` via `@theme` — no `tailwind.config.js`)
- **Package manager:** npm
- **Fonts:** `next/font` — Fraunces (display/headlines) + Inter (body)
- **Icons:** hand-rolled inline SVGs in `src/components/icons.tsx` (no icon library)
- **Database / backend:** TBD — none yet. The AI search is currently a front-end UI shell with mocked responses (`src/lib/data.ts`), ready to wire to a real model later.

### Commands
- `npm run dev` — local dev server (localhost:3000)
- `npm run build` — production build (run this before pushing to catch type/build errors)

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
- **Folder structure:** `src/app/` (routes, layout, global CSS), `src/components/` (reusable UI), `src/lib/` (data & helpers). Import via the `@/` alias (e.g. `@/components/Hero`).
- **Components:** PascalCase files, one component per file. Server components by default; add `"use client"` only when interactivity (state/handlers) is needed.
- **Design tokens:** use the brand/ink color scales and `font-display`/`font-sans` defined in `globals.css` rather than hard-coded hex values.
- **Accessibility:** semantic HTML, `aria-*` on interactive elements, visible focus rings (already styled globally).
- **No unnecessary dependencies** — prefer inline SVGs and native APIs over new packages.

## Notes
- Both founders are running Claude Code locally via SSH into our own respective machines.
- Keep this file updated as the project evolves — it's the shared source of truth both our Claude Code sessions read from.
