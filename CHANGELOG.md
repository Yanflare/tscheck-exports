# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-06-13
### Added
- `--fix` flag: removes `export` keyword from unused exports without
  deleting the declaration, modifying source files in place
- `tests/fix.test.ts`: 6 tests covering function, class, and variable
  export removal; used export preservation; no-op guarantee for
  `--fix` not passed
### Changed
- `biome.json`: scoped linting to `src/` and `tests/` (excludes `dist/`)

## [0.1.0] - 2026-06-10

### Added
- `scan()` API — detects unused exports via ts-morph reference analysis
- CLI with `--json`, `--ignore`, and `--fix` flags
- Exit codes: 0 (clean), 1 (unused found), 2 (error)
- CI matrix: Node 18 / 20 / 22
- Full scaffold: CHANGELOG, CONTRIBUTING, SECURITY, LICENSE, issue templates, dependabot

[0.2.0]: https://github.com/Yanflare/tscheck-exports/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Yanflare/tscheck-exports/releases/tag/v0.1.0
