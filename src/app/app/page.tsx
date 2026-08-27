"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { decodeApiKey } from "@/lib/auth";

const I = {
  Upload: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  Download: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  Check: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  Alert: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
    </svg>
  ),
  Table: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" />
    </svg>
  ),
  Sparkle: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3l1.9 5.5L19 10l-5.1 1.5L12 17l-1.9-5.5L5 10l5.1-1.5L12 3z" />
    </svg>
  ),
  X: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
};

const STORAGE_KEY = "csv_api_key";
const FREE_TRIAL = 3;
const MAX_BYTES = 5 * 1024 * 1024;

const ALL_RULES = [
  { id: "whitespace", label: "Whitespace cleanup", desc: "Trim cells, collapse spaces, remove empty rows" },
  { id: "dedupe", label: "Deduplication", desc: "Remove duplicate rows" },
  { id: "normalize", label: "Column normalization", desc: "snake_case, camelCase, Title Case headers" },
  { id: "types", label: "Type inference", desc: "Detect email/phone/URL/date/number/boolean columns" },
  { id: "pii", label: "PII detection", desc: "Flag columns with personal data" },
];

const NORM_STYLES = ["snake_case", "lowerCamelCase", "title_case", "UPPERCASE"] as const;

interface SanitizeResponse {
  cleaned?: string;
  cleanedCsv?: string;
  headers?: string[];
  stats?: {
    inputRows: number;
    outputRows: number;
    dedupeRemoved: number;
    whitespaceTrimmed: number;
    emptyRowsRemoved: number;
    headerChanges: Record<string, string>;
    columnTypes: Array<{ column: string; type: string; confidence: number }> | null;
    piiColumns: Array<{ column: string; piiType: string; confidence: number; sampleValues: string[] }> | [];
  };
  warnings?: string[];
  remaining?: number | null;
  newKey?: string | null;
  mode?: "free" | "paid";
  error?: string;
}

export default function AppPage() {
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set(["all"]));
  const [normStyle, setNormStyle] = useState<typeof NORM_STYLES[number]>("snake_case");
  const [apiKey, setApiKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SanitizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setApiKey(stored);
      setKeyInput(stored);
      const p = decodeApiKey(stored);
      if (p) { setCredits(p.credits); setPlan(p.plan); }
    }
  }, []);

  const toggleRule = useCallback((id: string) => {
    setSelectedRules((prev) => {
      const next = new Set(prev);
      if (id === "all") {
        return next.has("all") ? new Set() : new Set(["all"]);
      }
      next.delete("all");
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === 0) next.add("all");
      return next;
    });
  }, []);

  const handleFile = useCallback((file: File | undefined | null) => {
    setError(null);
    if (!file) return;
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setError("Please upload a CSV file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File exceeds the 5 MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCsvText(reader.result);
        setFileName(file.name);
        setResult(null);
      }
    };
    reader.onerror = () => setError("Could not read file.");
    reader.readAsText(file);
  }, []);

  const saveKey = useCallback(() => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      localStorage.removeItem(STORAGE_KEY);
      setApiKey(""); setCredits(null); setPlan(null);
      setToast("API key removed.");
      return;
    }
    const p = decodeApiKey(trimmed);
    if (!p) { setToast("Invalid CSVSanitizer key."); return; }
    localStorage.setItem(STORAGE_KEY, trimmed);
    setApiKey(trimmed); setCredits(p.credits); setPlan(p.plan);
    setToast(`Welcome! ${p.credits} credits on the ${p.plan} plan.`);
  }, [keyInput]);

  const runSanitize = useCallback(async () => {
    if (!csvText) return;
    setLoading(true); setError(null); setResult(null);

    const rules = selectedRules.has("all") ? ["all"] : Array.from(selectedRules);
    const options: Record<string, unknown> = {};
    if (selectedRules.has("normalize") || selectedRules.has("all")) {
      options.normalize = { style: normStyle };
    }

    try {
      const res = await fetch("/api/sanitize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ csv: csvText, rules, options }),
      });
      const data: SanitizeResponse = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        if (data.remaining !== undefined && data.remaining !== null) setCredits(data.remaining);
      } else {
        setResult(data);
        if (data.remaining !== undefined && data.remaining !== null) setCredits(data.remaining);
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [csvText, selectedRules, normStyle, apiKey]);

  const downloadCleaned = useCallback(() => {
    if (!result?.cleanedCsv) return;
    const blob = new Blob([result.cleanedCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ? `cleaned_${fileName}` : "cleaned.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [result, fileName]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <I.Table className="h-4 w-4" />
            </span>
            CSV<span className="text-emerald-600">Sanitizer</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {credits !== null && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {credits} credits · {plan}
              </span>
            )}
            <Link href="/" className="text-slate-600 hover:text-slate-900">Home</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left column: input */}
          <div className="space-y-4 lg:col-span-2">
            {/* Upload */}
            <Card title="1. Upload CSV">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${dragOver ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:border-slate-400"}`}
              >
                <I.Upload className="h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-700">Drop CSV here or click to browse</p>
                <p className="mt-1 text-xs text-slate-500">Max 5 MB</p>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
                <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Browse files
                </button>
              </div>
              {fileName && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  <I.Check className="h-4 w-4 text-emerald-600" />
                  <span className="truncate font-medium">{fileName}</span>
                  <button onClick={() => { setCsvText(""); setFileName(""); setResult(null); }} className="ml-auto text-emerald-600 hover:text-emerald-800"><I.X className="h-4 w-4" /></button>
                </div>
              )}
              {error && !result && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
              {/* Text area for paste */}
              {!fileName && (
                <textarea
                  value={csvText}
                  onChange={(e) => { setCsvText(e.target.value); setResult(null); }}
                  placeholder="Or paste CSV data here..."
                  className="mt-3 h-32 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              )}
            </Card>

            {/* Rules */}
            <Card title="2. Select rules">
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50">
                  <input type="checkbox" checked={selectedRules.has("all")} onChange={() => toggleRule("all")} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">All rules</p>
                    <p className="text-xs text-slate-500">Run all cleaning rules in sequence</p>
                  </div>
                </label>
                {ALL_RULES.map((r) => (
                  <label key={r.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50">
                    <input type="checkbox" checked={!selectedRules.has("all") && selectedRules.has(r.id)} onChange={() => toggleRule(r.id)} disabled={selectedRules.has("all")} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-40" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{r.label}</p>
                      <p className="text-xs text-slate-500">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Normalize style picker */}
              {(selectedRules.has("normalize") || selectedRules.has("all")) && (
                <div className="mt-3 rounded-lg border border-slate-200 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Normalize style</p>
                  <div className="flex flex-wrap gap-1.5">
                    {NORM_STYLES.map((s) => (
                      <button key={s} type="button" onClick={() => setNormStyle(s)} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${normStyle === s ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* API Key */}
            <Card title="3. API key (optional)">
              <div className="flex gap-2">
                <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="csv_..." className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs text-slate-700 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                <button type="button" onClick={saveKey} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                  Save
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {apiKey ? `Active: ${credits ?? "?"} credits (${plan ?? "?"} plan)` : "No key — using free trial (3 calls/day/IP)"}
              </p>
            </Card>

            {/* Run button */}
            <button
              type="button"
              onClick={runSanitize}
              disabled={!csvText || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  Sanitizing...
                </>
              ) : (
                <>
                  <I.Sparkle className="h-5 w-5" />
                  Sanitize CSV
                </>
              )}
            </button>
          </div>

          {/* Right column: results */}
          <div className="space-y-4 lg:col-span-3">
            <h2 className="text-lg font-bold text-slate-900">Results</h2>

            {error && result === null && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <I.Alert className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div><p className="font-semibold">Error</p><p className="mt-0.5">{error}</p></div>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
                  <I.Table className="h-7 w-7" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900">Results will appear here</p>
                <p className="mt-1 max-w-sm text-xs text-slate-500">Upload or paste a CSV, select rules, then click <strong>Sanitize CSV</strong>.</p>
              </div>
            )}

            {loading && (
              <div className="space-y-3">
                <div className="h-40 rounded-xl bg-slate-100 shimmer" />
                <div className="h-32 rounded-xl bg-slate-100 shimmer" />
              </div>
            )}

            {result && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatCard label="Input rows" value={result.stats?.inputRows ?? 0} />
                  <StatCard label="Output rows" value={result.stats?.outputRows ?? 0} accent />
                  <StatCard label="Duplicates removed" value={result.stats?.dedupeRemoved ?? 0} />
                  <StatCard label="Cells trimmed" value={result.stats?.whitespaceTrimmed ?? 0} />
                </div>

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <p className="font-semibold">Warnings</p>
                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                      {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                {/* Header changes */}
                {result.stats?.headerChanges && Object.keys(result.stats.headerChanges).length > 0 && (
                  <Card title="Header changes">
                    <div className="space-y-1">
                      {Object.entries(result.stats.headerChanges).map(([from, to]) => (
                        <div key={from} className="flex items-center gap-2 text-xs">
                          <code className="rounded bg-red-50 px-2 py-0.5 text-red-700 line-through">{from}</code>
                          <span className="text-slate-400">&rarr;</span>
                          <code className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">{to}</code>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Type inference */}
                {result.stats?.columnTypes && result.stats.columnTypes.length > 0 && (
                  <Card title="Type inference">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-slate-200 text-left text-slate-500">
                          <th className="pb-2 pr-4">Column</th><th className="pb-2 pr-4">Type</th><th className="pb-2">Confidence</th>
                        </tr></thead>
                        <tbody>
                          {result.stats.columnTypes.map((ct, i) => (
                            <tr key={i} className="border-b border-slate-100">
                              <td className="py-1.5 pr-4 font-mono font-medium text-slate-900">{ct.column}</td>
                              <td className="py-1.5 pr-4"><span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">{ct.type}</span></td>
                              <td className="py-1.5 text-slate-600">{(ct.confidence * 100).toFixed(0)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* PII columns */}
                {result.stats?.piiColumns && result.stats.piiColumns.length > 0 && (
                  <Card title="PII detection">
                    <div className="space-y-2">
                      {result.stats.piiColumns.map((pii, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs">
                          <I.Alert className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                          <div>
                            <p className="font-semibold text-red-800">{pii.column} <span className="font-normal text-red-600">({pii.piiType})</span></p>
                            <p className="text-red-600">Confidence: {(pii.confidence * 100).toFixed(0)}%{pii.sampleValues && pii.sampleValues.length > 0 ? ` — samples: ${pii.sampleValues.slice(0, 3).join(", ")}` : ""}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Preview cleaned CSV */}
                {result.cleanedCsv && (
                  <Card title="Cleaned CSV preview">
                    <pre className="max-h-64 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
                      {result.cleanedCsv.split("\n").slice(0, 20).join("\n")}
                      {(result.cleanedCsv.split("\n").length > 20) ? "\n... (truncated)" : ""}
                    </pre>
                    <button type="button" onClick={downloadCleaned} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                      <I.Download className="h-4 w-4" /> Download cleaned CSV
                    </button>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-xl">
          <I.Check className="h-4 w-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ? "text-emerald-700" : "text-slate-900"}`}>{value.toLocaleString()}</p>
    </div>
  );
}
