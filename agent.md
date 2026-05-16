# arenatuner Copilot Agent

This repository includes a minimal GitHub Copilot Chat custom agent definition and a set of example skills.
Use this agent to help with code review, project planning, and working inside the `arenatuner` repo.
The app uses a React + TypeScript + Vite + MUI frontend stack for building a small BO1 deck tuning UI.

## Agent metadata
- Name: arenatuner
- Purpose: Assist with deck-building app design, code changes, and developer workflows.
- Scope: Programming support, project guidance, feature brainstorming, and bug triage.

## Files
- `copilot-agent.yml` — agent manifest and prompt configuration.
- `skills/` — custom skill definitions used by this agent.

## Getting started
1. Open Copilot Chat.
2. Load this repository as a custom agent source.
3. Choose the agent definition from `copilot-agent.yml` or `agent.md`.
4. Ask the agent to summarize the repo, review code, or suggest next tasks.
