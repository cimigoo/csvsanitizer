export interface WhitespaceOptions {
  trim?: boolean;
  removeEmptyRows?: boolean;
  collapseSpaces?: boolean;
}

export interface WhitespaceResult {
  rows: string[][];
  trimmedCells: number;
  emptyRowsRemoved: number;
}

export function applyWhitespace(
  headers: string[],
  rows: string[][],
  options: WhitespaceOptions = {}
): WhitespaceResult {
  const {
    trim = true,
    removeEmptyRows = true,
    collapseSpaces = true,
  } = options;

  let trimmedCells = 0;
  let emptyRowsRemoved = 0;
  const result: string[][] = [];

  // Clean headers too
  const cleanHeaders = headers.map((h) => cleanCell(h, trim, collapseSpaces));

  for (const row of rows) {
    const cleaned = row.map((cell) => {
      const c = cleanCell(cell, trim, collapseSpaces);
      if (c !== cell) trimmedCells++;
      return c;
    });

    if (removeEmptyRows && cleaned.every((c) => c === "")) {
      emptyRowsRemoved++;
      continue;
    }

    result.push(cleaned);
  }

  return { rows: result, trimmedCells, emptyRowsRemoved };
}

function cleanCell(cell: string, trim: boolean, collapseSpaces: boolean): string {
  let c = cell;
  if (trim) c = c.trim();
  if (collapseSpaces) c = c.replace(/\s+/g, " ");
  return c;
}
