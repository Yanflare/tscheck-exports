export interface UnusedExport {
  file: string;
  line: number;
  name: string;
  kind: "function" | "class" | "interface" | "type" | "enum" | "variable" | "unknown";
}

export interface ScanResult {
  unusedExports: UnusedExport[];
  scannedFiles: number;
  durationMs: number;
}

export interface ScanOptions {
  tsConfigPath: string;
  ignore: string[];
  fix: boolean;
}
