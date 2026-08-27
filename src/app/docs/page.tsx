import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Reference",
  description: "Complete API reference for CSVSanitizer — endpoint documentation, request/response examples, and integration guides.",
};

export default function DocsPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
            API Reference
          </h1>
          <p className="text-lg text-slate-600">
            Everything you need to integrate CSVSanitizer into your data pipeline.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Base URL */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Base URL</h2>
            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm">
              https://csvsanitizer.vercel.app/api/sanitize
            </div>
          </div>

          {/* Authentication */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication</h2>
            <p className="text-slate-600 mb-4">
              Include your API key in the request header:
            </p>
            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm">
              Authorization: Bearer YOUR_API_KEY
            </div>
            <p className="text-slate-500 text-sm mt-3">
              Get your API key after subscribing to any paid plan. Free tier users can use the API without authentication (limited to 3 calls).
            </p>
          </div>

          {/* Endpoint */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">POST /api/sanitize</h2>
            <p className="text-slate-600 mb-4">
              Clean, deduplicate, normalize, and flag PII in CSV data.
            </p>

            <h3 className="text-lg font-semibold text-slate-800 mb-3">Request Body (JSON)</h3>
            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
{`{
  "csv": "Name, Email\\nJohn, john@test.com\\nJane, jane@test.com",
  "rules": ["whitespace", "dedupe", "normalize", "infer-types", "flag-pii"]
}`}
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Parameters</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Parameter</th>
                    <th className="text-left p-3 font-semibold">Type</th>
                    <th className="text-left p-3 font-semibold">Required</th>
                    <th className="text-left p-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200">
                    <td className="p-3 font-mono text-blue-600">csv</td>
                    <td className="p-3">string</td>
                    <td className="p-3">Yes</td>
                    <td className="p-3">CSV data as string, base64, or multipart file</td>
                  </tr>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td className="p-3 font-mono text-blue-600">rules</td>
                    <td className="p-3">string[]</td>
                    <td className="p-3">No</td>
                    <td className="p-3">Rules to apply. Use [&quot;all&quot;] for everything</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Available Rules</h3>
            <div className="space-y-3">
              {[
                { name: "whitespace", desc: "Trim whitespace from all cells, remove empty rows and columns" },
                { name: "dedupe", desc: "Remove duplicate rows (exact match)" },
                { name: "normalize", desc: "Normalize column names to snake_case" },
                { name: "infer-types", desc: "Detect column types: email, phone, url, date, number, boolean" },
                { name: "flag-pii", desc: "Flag PII: emails, phones, SSNs, credit cards, IP addresses" },
                { name: "all", desc: "Apply all rules above in one call" },
              ].map((rule, i) => (
                <div key={i} className="flex gap-4 bg-white border border-slate-200 rounded-lg p-4">
                  <code className="text-blue-600 font-mono font-semibold whitespace-nowrap">{rule.name}</code>
                  <span className="text-slate-600">{rule.desc}</span>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Response (200 OK)</h3>
            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "cleaned_csv": "name,email\\njohn,john@test.com\\njane,jane@test.com",
    "stats": {
      "original_rows": 3,
      "cleaned_rows": 2,
      "duplicates_removed": 1,
      "empty_rows_removed": 0
    },
    "rules_applied": ["whitespace", "dedupe", "normalize"]
  }
}`}
            </div>
          </div>

          {/* Code Examples */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Code Examples</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mb-3">cURL</h3>
            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
{`curl -X POST https://csvsanitizer.vercel.app/api/sanitize \\
  -H "Content-Type: application/json" \\
  -d '{"csv": "Name, Email\\nJohn, john@test.com", "rules": ["all"]}'`}
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Python</h3>
            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
{`import requests

response = requests.post(
    "https://csvsanitizer.vercel.app/api/sanitize",
    json={
        "csv": "Name, Email\\nJohn, john@test.com",
        "rules": ["all"]
    }
)
print(response.json())`}
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">JavaScript</h3>
            <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm overflow-x-auto">
{`const response = await fetch("https://csvsanitizer.vercel.app/api/sanitize", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    csv: "Name, Email\\nJohn, john@test.com",
    rules: ["all"]
  })
});
const data = await response.json();`}
            </div>
          </div>

          {/* Error Codes */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Error Codes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Code</th>
                    <th className="text-left p-3 font-semibold">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: "200", meaning: "Success" },
                    { code: "400", meaning: "Bad Request — invalid CSV or parameters" },
                    { code: "401", meaning: "Unauthorized — invalid or missing API key" },
                    { code: "402", meaning: "Payment Required — call limit exceeded" },
                    { code: "413", meaning: "Payload Too Large — CSV exceeds size limit" },
                    { code: "500", meaning: "Internal Server Error" },
                  ].map((err, i) => (
                    <tr key={i} className={`border-t border-slate-200 ${i % 2 === 1 ? 'bg-slate-50' : ''}`}>
                      <td className="p-3 font-mono font-semibold">{err.code}</td>
                      <td className="p-3 text-slate-600">{err.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              Start cleaning your CSV data
            </h2>
            <p className="text-blue-100 mb-6">
              3 free API calls. No credit card required.
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
    </main>
  );
}
