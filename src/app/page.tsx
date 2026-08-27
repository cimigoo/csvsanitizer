"use client";

import { useState } from "react";
import Link from "next/link";

const Icon = {
  Table: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18" />
    </svg>
  ),
  Shield: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Bolt: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  ),
  Layers: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 2l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5M3 17l9 5 9-5" />
    </svg>
  ),
  Check: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  Chevron: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  Arrow: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
  Code: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  ),
  Zap: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  ),
  Eye: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Clean: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),
};

const PLANS = [
  {
    id: "starter", name: "Starter", price: 5, credits: "1,000",
    tagline: "For individual developers & small scripts",
    features: ["1,000 API calls/month", "All 5 cleaning rules", "CSV up to 5 MB", "Type inference", "Community support", "1-day free trial"],
    priceIdEnv: "NEXT_PUBLIC_PADDLE_PRICE_STARTER", highlighted: false,
  },
  {
    id: "pro", name: "Pro", price: 15, credits: "5,000",
    tagline: "For growing teams & data pipelines",
    features: ["5,000 API calls/month", "Everything in Starter", "PII detection", "Priority processing", "Email support", "1-day free trial"],
    priceIdEnv: "NEXT_PUBLIC_PADDLE_PRICE_PRO", highlighted: true,
  },
  {
    id: "business", name: "Business", price: 39, credits: "30,000",
    tagline: "For enterprise data teams",
    features: ["30,000 API calls/month", "Everything in Pro", "Priority support", "Custom rule configs", "SLA guarantee", "1-day free trial"],
    priceIdEnv: "NEXT_PUBLIC_PADDLE_PRICE_BUSINESS", highlighted: false,
  },
];

const FEATURES = [
  { icon: Icon.Clean, title: "Whitespace Cleanup", desc: "Trim cells, collapse multiple spaces, remove empty rows. Clean up messy data in one call." },
  { icon: Icon.Layers, title: "Deduplication", desc: "Remove duplicate rows by full-row or per-column matching. Configurable column selection." },
  { icon: Icon.Code, title: "Column Normalization", desc: "Convert headers to snake_case, lowerCamelCase, or Title Case. Strip special characters." },
  { icon: Icon.Bolt, title: "Type Inference", desc: "Auto-detect email, phone, URL, date, number, boolean columns from your data patterns." },
  { icon: Icon.Shield, title: "PII Detection", desc: "Flag columns containing emails, phone numbers, SSNs, credit cards, IP addresses, and addresses." },
  { icon: Icon.Zap, title: "Combined Mode", desc: "Run all rules in a single call. Get cleaned CSV + full stats + PII report in one response." },
];

const STEPS = [
  { icon: Icon.Code, title: "Send CSV", desc: "POST your raw CSV as base64, raw text, or multipart file upload." },
  { icon: Icon.Layers, title: "Pick Rules", desc: "Choose which cleaning rules to apply: dedupe, whitespace, normalize, types, PII." },
  { icon: Icon.Bolt, title: "Get Results", desc: "Receive cleaned CSV (base64) with full stats: rows removed, types detected, PII flagged." },
  { icon: Icon.Zap, title: "Integrate", desc: "Drop into your ETL pipeline, CI/CD, or data warehouse loader. Zero dependencies." },
];

const FAQS = [
  { q: "What CSV cleaning rules are available?", a: "Five core rules: whitespace cleanup (trim, collapse spaces, remove empty rows), deduplication (full-row or per-column), column name normalization (snake_case, camelCase, Title Case), type inference (email/phone/URL/date/number/boolean), and PII detection (email, phone, SSN, credit card, IP address, address columns)." },
  { q: "Does CSVSanitizer use AI or LLMs?", a: "No. CSVSanitizer is 100% rule-based — pure string matching and regex patterns. No AI, no LLMs, no external API calls. Your data never leaves our server except to return the result, and we retain nothing." },
  { q: "What is the file size limit?", a: "Each API call accepts up to 5 MB of CSV data. For larger files, split them into chunks and process sequentially." },
  { q: "Do you store my CSV data?", a: "Zero data retention. CSV data is processed in-memory and returned in the response. We do not persist, log, or store any of your data. The only state we keep is an in-memory free-trial counter that resets on server cold-starts." },
  { q: "How does the free trial work?", a: "Every IP gets 3 free API calls per day, no API key required. Use the Playground to try the full cleaning pipeline before committing. For higher volume, subscribe to any plan — all include a 1-day free trial." },
  { q: "What is your refund policy?", a: "If CSVSanitizer materially fails to deliver the service described, contact us within 14 days of purchase for a full or pro-rated refund. See the Refund Policy page for details." },
];

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Icon.Table className="h-4 w-4" />
            </span>
            CSV<span className="text-emerald-600">Sanitizer</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/app" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Playground
            </Link>
            <a href="#pricing" className="hidden rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 sm:inline-block">
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-emerald-50/60 to-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Icon.Bolt className="h-3.5 w-3.5" /> Pure rules, zero AI — blazing fast
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Clean, normalize &amp; standardize CSV data in{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">one API call</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              Deduplicate, fix whitespace, normalize column names, infer types, and flag PII — all with a single POST request. Zero data retention. No AI. No database.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/app" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
                Try the Playground <Icon.Arrow className="h-4 w-4" />
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50">
                See pricing
              </a>
            </div>
          </div>

          {/* Code preview */}
          <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-slate-400">POST /api/sanitize</span>
            </div>
            <pre className="overflow-x-auto p-5 text-sm leading-relaxed text-slate-300">
{`curl -X POST https://csvsanitizer.vercel.app/api/sanitize \
  -H "Authorization: Bearer csv_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "csv": "Name, Email ,phone\nJohn, john@test.com, 555-0100\nJohn, john@test.com, 555-0100",
    "rules": ["all"]
  }'

# Response:
{
  "cleaned": "bmFtZSxl...",   // base64 cleaned CSV
  "stats": {
    "inputRows": 2,
    "outputRows": 1,            // deduped!
    "dedupeRemoved": 1,
    "headerChanges": { " Email ": "email" },
    "columnTypes": [
      { "column": "email", "type": "email", "confidence": 1.0 },
      { "column": "phone", "type": "phone", "confidence": 1.0 }
    ],
    "piiColumns": [
      { "column": "email", "piiType": "email", "confidence": 1.0 }
    ]
  },
  "warnings": ["1 duplicate row(s) removed.", "1 column(s) may contain PII."]
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything your CSV pipeline needs
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Five cleaning rules, one endpoint. Composable, stateless, fast.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Four steps to clean data
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              No SDK to install. No signup wall. Just send a CSV.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-black text-slate-200">{i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple, call-based pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Each API call = 1 credit. Monthly subscription, 1-day free trial on all plans.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => {
              const priceId = process.env[plan.priceIdEnv as keyof typeof process.env] || "";
              return (
                <div key={plan.id} className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition ${plan.highlighted ? "border-emerald-600 bg-white ring-2 ring-emerald-600" : "border-slate-200 bg-white"}`}>
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                    <span className="text-sm text-slate-500">/month</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-emerald-600">{plan.credits} calls/month</p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Icon.Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => { if (!priceId) { alert(`Set ${plan.priceIdEnv} to enable checkout.`); return; } alert(`Checkout would open for ${plan.name} — Paddle price: ${priceId}`); }} className={`mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${plan.highlighted ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"}`}>
                    Start 7-day trial
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Payments securely processed by Paddle. All plans include all cleaning rules.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {FAQS.map((f, i) => {
              const open = faqOpen === i;
              return (
                <div key={f.q}>
                  <button type="button" onClick={() => setFaqOpen(open ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                    <span className="text-base font-semibold text-slate-900">{f.q}</span>
                    <Icon.Chevron className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{f.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-8 py-14 text-center shadow-xl sm:px-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to clean your CSV data?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-emerald-100">
            Start with 3 free API calls. No credit card. No signup. Just POST your data.
          </p>
          <Link href="/app" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50">
            Open the Playground <Icon.Arrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Icon.Table className="h-4 w-4" />
              </span>
              CSV<span className="text-emerald-600">Sanitizer</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <Link href="/docs" className="hover:text-slate-900">API Docs</Link>
              <Link href="/faq" className="hover:text-slate-900">FAQ</Link>
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
              <Link href="/refunds" className="hover:text-slate-900">Refunds</Link>
              <a href="mailto:hello@csvsanitizer.com" className="hover:text-slate-900">Contact</a>
            </nav>
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} CSVSanitizer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
