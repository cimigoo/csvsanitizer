import { NextRequest, NextResponse } from "next/server";
import { sanitize, type Rule, type SanitizeOptions } from "@/lib/sanitizer";
import {
  verifyApiKey,
  deductCredits,
  extractApiKey,
} from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_CSV_BYTES = 5 * 1024 * 1024;
const FREE_TRIAL_LIMIT = 3;

const GLOBAL: Record<string, unknown> = globalThis as unknown as Record<string, unknown>;
if (!GLOBAL.__csv_freeTrialMap) {
  GLOBAL.__csv_freeTrialMap = new Map<string, number>();
}
const trialStore: Map<string, number> = GLOBAL.__csv_freeTrialMap as Map<string, number>;

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip") || "unknown";
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let csvInput: string | null = null;
    let rules: Rule[] = ["whitespace"];
    let options: SanitizeOptions = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "No CSV file provided. Send as \"file\" field." }, { status: 400 });
      }
      if (file.size > MAX_CSV_BYTES) {
        return NextResponse.json({ error: "File exceeds the 5 MB limit." }, { status: 413 });
      }
      const buf = await file.arrayBuffer();
      csvInput = Buffer.from(buf).toString("utf-8");
      const rulesParam = formData.get("rules");
      if (rulesParam && typeof rulesParam === "string") {
        try { rules = JSON.parse(rulesParam); } catch { rules = [rulesParam as Rule]; }
      }
      const optParam = formData.get("options");
      if (optParam && typeof optParam === "string") {
        try { options = JSON.parse(optParam); } catch { /* use defaults */ }
      }
    } else {
      const body = await req.json();
      
      if (body.file && typeof body.file === "string") {
        try { csvInput = Buffer.from(body.file, "base64").toString("utf-8"); }
        catch { return NextResponse.json({ error: "Invalid base64 in \"file\" field." }, { status: 400 }); }
      } else if (body.csv && typeof body.csv === "string") {
        csvInput = body.csv;
      } else if (body.data && typeof body.data === "string") {
        csvInput = body.data;
      }

      if (Array.isArray(body.rules) && body.rules.length > 0) {
        rules = body.rules;
      }
      if (body.options && typeof body.options === "object") {
        options = body.options;
      }
    }

    if (!csvInput || typeof csvInput !== "string") {
      return NextResponse.json(
        { error: "CSV data is required. Provide \"csv\" (string), \"file\" (base64), or multipart upload." },
        { status: 400 }
      );
    }
    if (Buffer.byteLength(csvInput, "utf8") > MAX_CSV_BYTES) {
      return NextResponse.json({ error: "CSV data exceeds the 5 MB limit." }, { status: 413 });
    }

    // Auth & credits
    let remainingCredits: number | null = null;
    let newKey: string | null = null;
    let mode: "free" | "paid" = "free";

    const { key: apiKey, error: keyError } = extractApiKey(req.headers);
    if (apiKey && !keyError) {
      const v = verifyApiKey(apiKey);
      if (v.valid) {
        mode = "paid";
        const d = deductCredits(apiKey);
        if ("error" in d) {
          return NextResponse.json({ error: d.error, remaining: 0 }, { status: 429 });
        }
        remainingCredits = d.remaining;
        newKey = d.newKey;
      }
    }

    if (mode === "free") {
      const ip = getClientIp(req);
      const used = trialStore.get(ip) || 0;
      if (used >= FREE_TRIAL_LIMIT) {
        return NextResponse.json(
          { error: `Free trial limit (${FREE_TRIAL_LIMIT} calls/day) reached. Subscribe for unlimited access.`, freeTrialLimit: FREE_TRIAL_LIMIT },
          { status: 429 }
        );
      }
      trialStore.set(ip, used + 1);
      remainingCredits = FREE_TRIAL_LIMIT - used - 1;
    }

    // Run sanitizer
    const result = sanitize(csvInput, rules, options);

    return NextResponse.json({
      cleaned: result.cleanedBase64,
      cleanedCsv: result.cleaned,
      headers: result.headers,
      stats: {
        inputRows: result.stats.inputRows,
        outputRows: result.stats.outputRows,
        dedupeRemoved: result.stats.dedupeRemoved,
        whitespaceTrimmed: result.stats.whitespaceTrimmed,
        emptyRowsRemoved: result.stats.emptyRowsRemoved,
        headerChanges: result.stats.headerChanges,
        columnTypes: result.stats.columnTypes?.columnTypes || null,
        piiColumns: result.stats.piiResult?.piiColumns || [],
      },
      warnings: result.warnings,
      remaining: remainingCredits,
      newKey,
      mode,
    });
  } catch (err) {
    console.error("[sanitize] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
