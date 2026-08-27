export interface DedupeOptions {
  columns?: string[];
}

export interface DedupeResult {
  rows: string[][];
  removedCount: number;
}

export function applyDedupe(
  headers: string[],
  rows: string[][],
  options: DedupeOptions = {}
): DedupeResult {
  const seen = new Set<string>();
  const result: string[][] = [];
  let removedCount = 0;

  const colIndices = options.columns && options.columns.length > 0
    ? options.columns.map((c) => headers.indexOf(c)).filter((i) => i >= 0)
    : null;

  for (const row of rows) {
    let key: string;
    if (colIndices) {
      key = colIndices.map((i) => (row[i] || "").trim().toLowerCase()).join("\x00");
    } else {
      key = row.map((c) => (c || "").trim().toLowerCase()).join("\x00");
    }
    if (seen.has(key)) {
      removedCount++;
    } else {
      seen.add(key);
      result.push(row);
    }
  }

  return { rows: result, removedCount };
}
