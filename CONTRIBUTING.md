# Contributing to tscheck-exports

Thank you for your interest in contributing.

## Setup

```bash
git clone https://github.com/Yanflare/tscheck-exports.git
cd tscheck-exports
npm install
npm test
```

## Development workflow

1. Fork and create a branch: `feat/your-feature` or `fix/your-fix`
2. Make your changes with tests
3. Run `npm test && npm run typecheck && npm run lint`
4. Open a PR against `main` — CI must be green before merge

## Commit style

[Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`

## Reporting bugs

Use the GitHub issue tracker. Include your Node version, tscheck-exports version, and a minimal reproduction.
