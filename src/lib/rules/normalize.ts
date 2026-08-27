export type NormalizeStyle = "snake_case" | "lowerCamelCase" | "title_case" | "UPPERCASE";

export interface NormalizeOptions {
  style?: NormalizeStyle;
  removeSpecialChars?: boolean;
}

export interface NormalizeResult {
  headers: string[];
  headerChanges: Record<string, string>;
}

export function applyNormalize(
  headers: string[],
  rows: string[][],
  options: NormalizeOptions = {}
): NormalizeResult & { rows: string[][] } {
  const {
    style = "snake_case",
    removeSpecialChars = true,
  } = options;

  const headerChanges: Record<string, string> = {};
  const newHeaders = headers.map((h) => {
    const normalized = normalizeHeader(h, style, removeSpecialChars);
    if (normalized !== h) {
      headerChanges[h] = normalized;
    }
    return normalized;
  });

  return { headers: newHeaders, headerChanges, rows };
}

function normalizeHeader(header: string, style: NormalizeStyle, removeSpecialChars: boolean): string {
  let h = header;

  if (removeSpecialChars) {
    h = h.replace(/[^a-zA-Z0-9\s_\-]/g, "");
  }

  // Split into words
  let words: string[];

  // If already contains underscores, split on them
  if (h.includes("_")) {
    words = h.split("_").map((w) => w.trim()).filter(Boolean);
  } else if (h.includes("-")) {
    words = h.split("-").map((w) => w.trim()).filter(Boolean);
  } else {
    // Split on camelCase boundaries and spaces
    words = h
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(/\s+/)
      .map((w) => w.trim())
      .filter(Boolean);
  }

  switch (style) {
    case "snake_case":
      return words.map((w) => w.toLowerCase()).join("_");
    case "lowerCamelCase":
      return words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join("");
    case "title_case":
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    case "UPPERCASE":
      return words.map((w) => w.toUpperCase()).join("_");
    default:
      return h;
  }
}
