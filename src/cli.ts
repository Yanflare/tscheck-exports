#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";
import { scan } from "./scanner.js";
import type { UnusedExport } from "./types.js";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  version: string;
};

const program = new Command();

program
  .name("tscheck-exports")
  .description("Find unused TypeScript exports. CI-ready with JSON output.")
  .version(pkg.version)
  .argument("[tsconfig]", "Path to tsconfig.json", "tsconfig.json")
  .option("--json", "Output results as JSON (for CI pipelines)")
  .option("--ignore <patterns...>", "Glob patterns to ignore", [])
  .option("--fix", "Remove export keywords from unused exports (modifies files)")
  .action((tsconfig: string, opts: { json: boolean; ignore: string[]; fix: boolean }) => {
    const tsConfigPath = resolve(process.cwd(), tsconfig);

    try {
      const result = scan({
        tsConfigPath,
        ignore: opts.ignore,
        fix: opts.fix,
      });

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        printHuman(result.unusedExports, result.scannedFiles, result.durationMs);
      }

      process.exit(result.unusedExports.length > 0 ? 1 : 0);
    } catch (err) {
      if (opts.json) {
        console.error(JSON.stringify({ error: String(err) }));
      } else {
        console.error(`error: ${String(err)}`);
      }
      process.exit(2);
    }
  });

function printHuman(unused: UnusedExport[], scannedFiles: number, durationMs: number): void {
  if (unused.length === 0) {
    console.log(`✓ No unused exports found (${scannedFiles} files, ${durationMs}ms)`);
    return;
  }

  console.log(`Found ${unused.length} unused export(s):\n`);
  for (const u of unused) {
    console.log(`  ${u.file}:${u.line}  ${u.kind}  ${u.name}`);
  }
  console.log(`\nScanned ${scannedFiles} files in ${durationMs}ms`);
}

program.parse();
