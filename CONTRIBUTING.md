# Contributing to Coinicx

Thanks for your interest in contributing! This document outlines how to propose changes and the standards we follow.

## Code of Conduct

By participating, you agree to uphold a respectful, inclusive environment. Please be considerate and constructive in all interactions.

## Getting Started

1. Fork the repository and create your branch from `main` or the relevant feature branch.
2. Ensure you have Node.js 18.18+ or 20+.
3. Install dependencies and set up environment variables in `.env.local`:
   ```bash
   NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id
   NEXT_PUBLIC_WEB3_NETWORK=testnet
   ```
4. Run the app locally:
   ```bash
   npm install
   npm run dev
   ```

## Branching and Commits

- Use feature branches: `feat/<short-description>`, `fix/<short-description>`, `chore/<task>`, `docs/<topic>`
- Write descriptive commit messages in the imperative mood:
  - "Add order book virtualization"
  - "Fix kline stream reconnect logic"

## Development Workflow

- Write clear, readable code following the project style:
  - TypeScript with explicit types for public APIs
  - Prefer early returns and simple control flow
  - Keep functions small and focused
- Run checks locally before pushing:
  ```bash
  npm run lint
  npm run build
  ```

## Project Structure

- Pages and layouts: `src/app/**`
- Feature components: `src/components/**`
- Config and web3: `src/config/**`
- Data/services: `src/services/**`
- State: `src/store/**`
- Utilities: `src/utils/**`

## Adding Features

- Discuss significant changes via an issue before starting
- Keep PRs scoped and focused; large PRs are harder to review
- Include tests when applicable and update docs/README as needed

## Coding Standards

- ESLint and Prettier are configured; keep imports sorted and code formatted
- Use meaningful names; avoid abbreviations and single-letter identifiers
- Avoid deep nesting; extract functions/components

## UI/UX

- Use existing `src/components/ui/**` primitives where possible
- Keep accessibility in mind (labels, roles, keyboard interactions)

## Submitting a Pull Request

1. Sync with the latest `main`
2. Rebase your branch to keep history clean
3. Ensure CI checks pass locally (`lint`, `build`)
4. Open a PR with:
   - Descriptive title and summary
   - Screenshots or recordings for UI changes
   - Notes on breaking changes or migrations

## Reporting Bugs

- Use the issue tracker and include:
  - Steps to reproduce
  - Expected vs. actual behavior
  - Screenshots/logs if relevant
  - Environment info (OS, browser, Node version)

## License

By contributing, you agree that your contributions will be licensed under the MIT License of this repository.
