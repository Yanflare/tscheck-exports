import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { scan } from "../src/scanner.js";

const FIXTURE = resolve(import.meta.dirname, "fixtures/simple/tsconfig.json");

describe("scan()", () => {
  it("detects unused exports", () => {
    const result = scan({ tsConfigPath: FIXTURE, ignore: [], fix: false });
    const names = result.unusedExports.map((u) => u.name);
    expect(names).toContain("unusedFunction");
  });

  it("does not flag used exports", () => {
    const result = scan({ tsConfigPath: FIXTURE, ignore: [], fix: false });
    const names = result.unusedExports.map((u) => u.name);
    expect(names).not.toContain("usedFunction");
  });

  it("returns scannedFiles count", () => {
    const result = scan({ tsConfigPath: FIXTURE, ignore: [], fix: false });
    expect(result.scannedFiles).toBe(2);
  });

  it("returns durationMs as a number", () => {
    const result = scan({ tsConfigPath: FIXTURE, ignore: [], fix: false });
    expect(typeof result.durationMs).toBe("number");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("reports correct file path for unused export", () => {
    const result = scan({ tsConfigPath: FIXTURE, ignore: [], fix: false });
    const entry = result.unusedExports.find((u) => u.name === "unusedFunction");
    expect(entry?.file).toContain("used.ts");
  });

  it("reports kind as function", () => {
    const result = scan({ tsConfigPath: FIXTURE, ignore: [], fix: false });
    const entry = result.unusedExports.find((u) => u.name === "unusedFunction");
    expect(entry?.kind).toBe("function");
  });

  it("respects ignore patterns", () => {
    const result = scan({ tsConfigPath: FIXTURE, ignore: ["**/used.ts"], fix: false });
    const names = result.unusedExports.map((u) => u.name);
    expect(names).not.toContain("unusedFunction");
  });
});
