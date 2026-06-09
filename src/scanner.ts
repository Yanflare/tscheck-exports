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
          removeExportKeyword(sourceFile, name);
        }
      }
    }
  }

  if (options.fix) {
    project.saveSync();
  }

  return {
    unusedExports,
    scannedFiles: sourceFiles.length,
    durationMs: Date.now() - start,
  };
}

function removeExportKeyword(sourceFile: SourceFile, exportName: string): void {
  const exports = sourceFile.getExportedDeclarations();
  const declarations = exports.get(exportName);
  if (!declarations) return;

  for (const decl of declarations) {
    const parent = decl.getParent();
    if (!parent) continue;

    const target =
      parent.getKind() === SyntaxKind.VariableDeclarationList ? parent.getParent() : parent;

    if (!target) continue;

    const exportKeyword = target
      .getChildren()
      .find((c) => c.getKind() === SyntaxKind.ExportKeyword);

    exportKeyword?.replaceWithText("");
  }
}
