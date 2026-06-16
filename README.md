# tscheck-exports

[![CI](https://github.com/Yanflare/tscheck-exports/actions/workflows/ci.yml/badge.svg)](https://github.com/Yanflare/tscheck-exports/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/tscheck-exports)](https://www.npmjs.com/package/tscheck-exports)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Unused exports bloat your production bundles and accumulate dead code that makes future refactors
slower and riskier. `tscheck-exports` finds them with zero config and can remove them safely
via `--fix`.

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

## CI usage

```yaml
- name: Check for unused exports
  run: npx tscheck-exports --json | tee unused-exports.json
  # Exits 1 if any unused exports are found
```

## --fix

`--fix` removes only the `export` keyword from unused exports. The declaration itself stays in
the file so you do not accidentally break anything that still imports it. It surgically removes
just the `export` keyword without touching anything else.

## Why not knip?

`knip` is a comprehensive project-health tool. `tscheck-exports` does one thing: finds unused
exports and gets out of the way. No config file needed, JSON output that pipes cleanly into CI
dashboards, and `--fix for safe auto-removal.

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
