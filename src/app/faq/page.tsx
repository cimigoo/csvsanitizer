import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about CSVSanitizer API — pricing, usage, privacy, and technical details.",
};

const faqs = [
  {
    q: "What does CSVSanitizer do?",
    a: "CSVSanitizer is a REST API that cleans, deduplicates, normalizes, and flags PII in CSV data. Send your messy CSV via a single POST request, specify which rules to apply (or use \"all\"), and get clean data back instantly."
  },
  {
    q: "How do I use the API?",
    a: "Send a POST request to /api/sanitize with your CSV data in the request body. You can pass data as JSON ({\"csv\": \"...\"}), base64-encoded, or as multipart/form-data. Specify which cleaning rules to apply via the \"rules\" array, or use [\"all\"] to run everything."
  },
  {
    q: "What cleaning rules are available?",
    a: "Six rules: (1) whitespace — trim and remove empty rows, (2) dedupe — remove duplicate rows, (3) normalize — standardize column names to snake_case, (4) infer-types — detect emails, phones, URLs, dates, numbers, booleans, (5) flag-pii — detect personally identifiable information, (6) all — run every rule in one call."
  },
  {
    q: "Is my data safe?",
    a: "Yes. CSVSanitizer has zero data retention. Your CSV is processed entirely in memory on Vercel Edge Functions and returned immediately. Nothing is stored, logged, or sent to third parties. No database, no file storage."
  },
  {
    q: "What's the free tier?",
    a: "You get 3 free API calls to try out the service. No credit card required."
  },
  {
    q: "What are the paid plans?",
    a: "Starter: $9/mo for 1,000 calls. Pro: $29/mo for 5,000 calls with PII detection. Business: $79/mo for 30,000 calls. All paid plans include a 7-day free trial."
  },
  {
    q: "Do I need to install anything?",
    a: "No. CSVSanitizer is a cloud API. Just make HTTP requests from any programming language — Python, JavaScript, Go, Ruby, Java, etc. We provide curl examples and code snippets in the documentation."
  },
  {
    q: "What's the rate limit?",
    a: "Free tier: 3 calls total. Paid plans: your monthly call limit resets each billing cycle. There's no per-minute rate limit for paid users."
  },
  {
    q: "Can I use it in my CI/CD pipeline?",
    a: "Absolutely. CSVSanitizer is designed to be CI/CD friendly. Add it as a step in your data pipeline to clean CSVs automatically before processing."
  },
  {
    q: "What file formats are supported?",
    a: "CSV (comma-separated values). The API accepts standard CSV format with configurable delimiters. Column names are automatically normalized."
  },
  {
    q: "How is PII detection different from type inference?",
    a: "Type inference identifies data types (email, phone, URL, date, number, boolean) and adds a type hint column. PII detection specifically flags sensitive personal information (emails, phone numbers, SSNs, credit cards, IP addresses) in a separate pii_flags column for compliance review."
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. If you're not satisfied, you can request a refund within 14 days of purchase. See our /refunds page for details."
  }
];

export default function FAQPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-slate-600">
            Everything you need to know about CSVSanitizer API.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">
                  {faq.q}
                </h2>
                <p className="text-slate-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to clean your CSV data?
            </h2>
            <p className="text-blue-100 mb-6">
              Start with 3 free API calls. No credit card required.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition"
            >
              Try the API →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": f.a
              }
            }))
          })
        }}
      />
    </main>
  );
}
