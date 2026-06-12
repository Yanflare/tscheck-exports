import { writeFileSync } from "node:fs";
import { minimatch } from "minimatch";
import { Node, Project, type SourceFile, SyntaxKind } from "ts-morph";
import type { ScanOptions, ScanResult, UnusedExport } from "./types.js";

function getExportKind(node: Node): UnusedExport["kind"] {
  switch (node.getKind()) {
    case SyntaxKind.FunctionDeclaration:
      return "function";
    case SyntaxKind.ClassDeclaration:
      return "class";
    case SyntaxKind.InterfaceDeclaration:
      return "interface";
    case SyntaxKind.TypeAliasDeclaration:
      return "type";
    case SyntaxKind.EnumDeclaration:
      return "enum";
    case SyntaxKind.VariableStatement:
    case SyntaxKind.VariableDeclaration:
      return "variable";
    default:
      return "unknown";
  }
}

function isIgnored(filePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => minimatch(filePath, pattern, { matchBase: true }));
}

interface WithReferences {
  findReferencesAsNodes(): Node[];
}

function hasReferencesOutside(declaration: Node, sourceFile: SourceFile): boolean {
  if (Node.isSourceFile(declaration)) return true;

  try {
    const referenceable = declaration as unknown as WithReferences;
    const refs = referenceable.findReferencesAsNodes();
    return refs.some((ref: Node) => ref.getSourceFile().getFilePath() !== sourceFile.getFilePath());
  } catch {
    return true;
  }
}

export function scan(options: ScanOptions): ScanResult {
  const start = Date.now();
  const project = new Project({
    tsConfigFilePath: options.tsConfigPath,
    skipAddingFilesFromTsConfig: false,
  });

  const sourceFiles = project.getSourceFiles();
  const unusedExports: UnusedExport[] = [];

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();

    if (isIgnored(filePath, options.ignore)) {
      continue;
    }

    const exports = sourceFile.getExportedDeclarations();
    const fixRanges: [number, number][] = [];

    for (const [name, declarations] of exports) {
      if (name === "default") continue;

      const declaration = declarations[0];
      if (!declaration) continue;

      if (!hasReferencesOutside(declaration, sourceFile)) {
        unusedExports.push({
          file: filePath,
          line: declaration.getStartLineNumber(),
          name,
          kind: getExportKind(declaration),
        });

        if (options.fix) {
          const range = getExportKeywordRange(sourceFile, declaration);
          if (range) fixRanges.push(range);
        }
      }
    }

    // Apply all removals for this file at once, highest offset first,
    // so each splice does not invalidate earlier positions.
    if (fixRanges.length > 0) {
      fixRanges.sort((a, b) => b[0] - a[0]);
      let text = sourceFile.getFullText();
      for (const [start, end] of fixRanges) {
        text = text.slice(0, start) + text.slice(end);
      }
      writeFileSync(filePath, text, "utf8");
    }
  }

  return {
    unusedExports,
    scannedFiles: sourceFiles.length,
    durationMs: Date.now() - start,
  };
}

function getExportKeywordRange(sourceFile: SourceFile, decl: Node): [number, number] | null {
  const parent = decl.getParent();
  if (!parent) return null;

  const statementNode =
    parent.getKind() === SyntaxKind.VariableDeclarationList ? parent.getParent() : decl;
  if (!statementNode) return null;

  const syntaxList = statementNode.getChildren().find((c) => c.getKindName() === "SyntaxList");
  const exportKeyword = syntaxList
    ?.getChildren()
    .find((c) => c.getKind() === SyntaxKind.ExportKeyword);
  if (!exportKeyword) return null;

  const start = exportKeyword.getStart();
  const end = exportKeyword.getEnd();
  const trailingSpace = sourceFile.getFullText()[end] === " " ? 1 : 0;
  return [start, end + trailingSpace];
}
