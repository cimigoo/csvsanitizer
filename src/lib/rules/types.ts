export interface ColumnType {
  column: string;
  type: "email" | "phone" | "url" | "date" | "number" | "boolean" | "text";
  confidence: number;
}

export interface TypeResult {
  columnTypes: ColumnType[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;
const PHONE_RE = /^[\+]?[\d\s\-\(\)]{7,20}$/;
const DATE_RE = /^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}(T\d{2}:\d{2}(:\d{2})?)?$/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;
const BOOLEAN_RE = /^(true|false|yes|no|0|1)$/i;

function detectType(values: string[]): { type: ColumnType["type"]; confidence: number } {
  const nonEmpty = values.filter((v) => v.trim() !== "");
  if (nonEmpty.length === 0) return { type: "text", confidence: 0 };

  const sample = nonEmpty.slice(0, Math.min(100, nonEmpty.length));
  const checks: { type: ColumnType["type"]; re: RegExp }[] = [
    { type: "email", re: EMAIL_RE },
    { type: "url", re: URL_RE },
    { type: "date", re: DATE_RE },
    { type: "boolean", re: BOOLEAN_RE },
    { type: "number", re: NUMBER_RE },
    { type: "phone", re: PHONE_RE },
  ];

  for (const { type, re } of checks) {
    const matches = sample.filter((v) => re.test(v.trim())).length;
    const confidence = matches / sample.length;
    if (confidence >= 0.8) {
      return { type, confidence: Math.round(confidence * 100) / 100 };
    }
  }

  return { type: "text", confidence: 1 };
}

export function applyTypeInference(
  headers: string[],
  rows: string[][]
): TypeResult {
  const columnTypes: ColumnType[] = headers.map((header, colIndex) => {
    const values = rows.map((row) => row[colIndex] || "");
    const { type, confidence } = detectType(values);
    return { column: header, type, confidence };
  });

  return { columnTypes };
}
