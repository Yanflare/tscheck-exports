import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scan } from "../src/scanner.js";

const FIXTURE_DIR = resolve(import.meta.dirname, "fixtures/fix");
const FIXTURE = resolve(FIXTURE_DIR, "tsconfig.json");
const EXPORTS_FILE = resolve(FIXTURE_DIR, "src/exports.ts");

const ORIGINAL_CONTENT = readFileSync(EXPORTS_FILE, "utf8");

beforeEach(() => {
  writeFileSync(EXPORTS_FILE, ORIGINAL_CONTENT, "utf8");
});

afterEach(() => {
  writeFileSync(EXPORTS_FILE, ORIGINAL_CONTENT, "utf8");
});

describe("scan() --fix mode", () => {
  it("removes export keyword from unused function", () => {
    scan({ tsConfigPath: FIXTURE, ignore: [], fix: true });
    const content = readFileSync(EXPORTS_FILE, "utf8");
    expect(content).not.toMatch(/export function unusedFn/);
    expect(content).toMatch(/function unusedFn/);
  });

  it("removes export keyword from unused class", () => {
    scan({ tsConfigPath: FIXTURE, ignore: [], fix: true });
    const content = readFileSync(EXPORTS_FILE, "utf8");
    expect(content).not.toMatch(/export class UnusedClass/);
    expect(content).toMatch(/class UnusedClass/);
  });

  it("removes export keyword from unused variable", () => {
    scan({ tsConfigPath: FIXTURE, ignore: [], fix: true });
    const content = readFileSync(EXPORTS_FILE, "utf8");
    expect(content).not.toMatch(/export const unusedVar/);
    expect(content).toMatch(/const unusedVar/);
  });

  it("does not touch used exports", () => {
    scan({ tsConfigPath: FIXTURE, ignore: [], fix: true });
    const content = readFileSync(EXPORTS_FILE, "utf8");
    expect(content).toMatch(/export function usedFn/);
  });

  it("still returns unused exports in result when fix is true", () => {
    const result = scan({ tsConfigPath: FIXTURE, ignore: [], fix: true });
    const names = result.unusedExports.map((u) => u.name);
    expect(names).toContain("unusedFn");
    expect(names).toContain("UnusedClass");
    expect(names).toContain("unusedVar");
  });

  it("fix: false does not modify files", () => {
    const before = readFileSync(EXPORTS_FILE, "utf8");
    scan({ tsConfigPath: FIXTURE, ignore: [], fix: false });
    const after = readFileSync(EXPORTS_FILE, "utf8");
    expect(after).toBe(before);
  });
});
