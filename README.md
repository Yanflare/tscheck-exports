# tscheck-exports

[![CI](https://github.com/Yanflare/tscheck-exports/actions/workflows/ci.yml/badge.svg)](https://github.com/Yanflare/tscheck-exports/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/tscheck-exports)](https://www.npmjs.com/package/tscheck-exports)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Find unused TypeScript exports. Zero-config CI integration with structured JSON output and `--fix` auto-removal.

---

## Install

```bash
npm install -g tscheck-exports
# or use without installing:
npx tscheck-exports
```

## Quickstart

```bash
# Scan using tsconfig.json in the current directory
tscheck-exports

# Point at a specific tsconfig
tscheck-exports tsconfig.build.json

# CI-friendly: structured JSON output, exits 1 if unused exports found
tscheck-exports --json

# Ignore generated files
tscheck-exports --ignore "**/*.generated.ts" "**/dist/**"

# Auto-remove export keywords from unused exports
tscheck-exports --fix
```

## Why not knip?

`knip` is a comprehensive project-health tool. `tscheck-exports` does one thing: finds unused exports and gets out of the way. No config file needed, JSON output that pipes cleanly into CI dashboards, and `--fix` that surgically removes just the `export` keyword without touching anything else.

## CI usage

```yaml
- name: Check for unused exports
  run: npx tscheck-exports --json | tee unused-exports.json
  # Exits 1 if any unused exports are found
```

## Features

- Zero-config — reads your existing `tsconfig.json`
- `--json` structured output for CI pipelines and dashboards
- `--fix` auto-removes unused `export` keywords (non-destructive — keeps the declaration)
- `--ignore` glob patterns to skip generated files
- Exit code 0 = clean, 1 = unused exports found, 2 = error
- Node 18+ · TypeScript 5+

## Output
Found 3 unused export(s):
src/utils/format.ts:12  function  formatDate
src/helpers.ts:34       variable  DEBUG_FLAG
src/types.ts:8          interface OldSchema
Scanned 47 files in 340ms

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and PRs welcome.

## License

MIT — see [LICENSE](LICENSE).
