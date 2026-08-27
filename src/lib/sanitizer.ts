import { applyDedupe, type DedupeOptions } from "./rules/dedupe";
import { applyWhitespace, type WhitespaceOptions } from "./rules/whitespace";
import { applyNormalize, type NormalizeOptions } from "./rules/normalize";
import { applyTypeInference, type TypeResult } from "./rules/types";
import { applyPiiDetection, type PiiResult } from "./rules/pii";

export type Rule = "dedupe" | "whitespace" | "normalize" | "types" | "pii" | "all";

export interface SanitizeOptions {
  dedupe?: DedupeOptions;
  whitespace?: WhitespaceOptions;
  normalize?: NormalizeOptions;
}

export interface SanitizeStats {
  inputRows: number;
  outputRows: number;
  dedupeRemoved: number;
  whitespaceTrimmed: number;
  emptyRowsRemoved: number;
  headerChanges: Record<string, string>;
  columnTypes: TypeResult | null;
  piiResult: PiiResult | null;
}

export interface SanitizeWarning {
  rule: string;
  message: string;
}

export interface SanitizeResult {
  cleaned: string;
  cleanedBase64: string;
  headers: string[];
  stats: SanitizeStats;
  warnings: SanitizeWarning[];
}

function parseCSV(input: string): { headers: string[]; rows: string[][] } {
  const lines = input.split(/\r?\n/);
  const rows: string[][] = [];

  for (const line of lines) {
    if (line.trim() === "") continue;
    rows.push(parseCSVLine(line));
  }

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = rows[0];
  return { headers, rows: rows.slice(1) };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

function toCSV(headers: string[], rows: string[][]): string {
  const escapeField = (field: string) => {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
  };

  const lines = [headers.map(escapeField).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeField).join(","));
  }
  return lines.join("\n");
}

export function sanitize(
  input: string,
  rules: Rule[],
  options: SanitizeOptions = {}
): SanitizeResult {
  const warnings: SanitizeWarning[] = [];
  const { headers: parsedHeaders, rows: parsedRows } = parseCSV(input);

  if (parsedHeaders.length === 0) {
    warnings.push({ rule: "input", message: "Empty CSV — no data to process." });
    return {
      cleaned: "",
      cleanedBase64: "",
      headers: [],
      stats: {
        inputRows: 0, outputRows: 0, dedupeRemoved: 0,
        whitespaceTrimmed: 0, emptyRowsRemoved: 0,
        headerChanges: {}, columnTypes: null, piiResult: null,
      },
      warnings,
    };
  }

  let headers = [...parsedHeaders];
  let rows = parsedRows.map((r) => [...r]);
  const inputRows = rows.length;
  let dedupeRemoved = 0;
  let whitespaceTrimmed = 0;
  let emptyRowsRemoved = 0;
  let headerChanges: Record<string, string> = {};
  let columnTypes: TypeResult | null = null;
  let piiResult: PiiResult | null = null;

  const runAll = rules.includes("all");

  // 1. Whitespace
  if (runAll || rules.includes("whitespace")) {
    const ws = applyWhitespace(headers, rows, options.whitespace);
    rows = ws.rows;
    whitespaceTrimmed = ws.trimmedCells;
    emptyRowsRemoved = ws.emptyRowsRemoved;
  }

  // 2. Normalize headers
  if (runAll || rules.includes("normalize")) {
    const norm = applyNormalize(headers, rows, options.normalize);
    headers = norm.headers;
    headerChanges = norm.headerChanges;
    rows = norm.rows;
  }

  // 3. Dedupe
  if (runAll || rules.includes("dedupe")) {
    const dd = applyDedupe(headers, rows, options.dedupe);
    rows = dd.rows;
    dedupeRemoved = dd.removedCount;
    if (dedupeRemoved > 0) {
      warnings.push({
        rule: "dedupe",
        message: `${dedupeRemoved} duplicate row(s) removed.`,
      });
    }
  }

  // 4. Type inference (read-only, doesn't modify data)
  if (runAll || rules.includes("types")) {
    columnTypes = applyTypeInference(headers, rows);
  }

  // 5. PII detection (read-only, doesn't modify data)
  if (runAll || rules.includes("pii")) {
    piiResult = applyPiiDetection(headers, rows);
    if (piiResult.piiColumns.length > 0) {
      warnings.push({
        rule: "pii",
        message: `${piiResult.piiColumns.length} column(s) may contain PII: ${piiResult.piiColumns.map((c) => `${c.column} (${c.piiType})`).join(", ")}.`,
      });
    }
  }

  const csvOutput = toCSV(headers, rows);
  const cleanedBase64 = Buffer.from(csvOutput, "utf-8").toString("base64");

  return {
    cleaned: csvOutput,
    cleanedBase64,
    headers,
    stats: {
      inputRows,
      outputRows: rows.length,
      dedupeRemoved,
      whitespaceTrimmed,
      emptyRowsRemoved,
      headerChanges,
      columnTypes,
      piiResult,
    },
    warnings,
  };
}
