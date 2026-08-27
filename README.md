# CSVSanitizer — CSV Data Cleaning & Standardization API

Clean, deduplicate, normalize, infer types, and flag PII in CSV data — all with a single API call.

**Zero data retention • Pure rules (no AI) • Stateless • CI/CD friendly**

## Features

- **Whitespace cleanup** — trim cells, collapse spaces, remove empty rows
- **Deduplication** — full-row or per-column matching
- **Column normalization** — snake_case, lowerCamelCase, Title Case, UPPERCASE
- **Type inference** — email/phone/URL/date/number/boolean detection
- **PII detection** — flag columns with emails, phones, SSNs, credit cards, IP addresses
- **Combined mode** — run all rules in one call

## Quick Start

```bash
curl -X POST https://csvsanitizer.vercel.app/api/sanitize \
  -H "Content-Type: application/json" \
  -d '{
    "csv": "Name, Email ,phone\nJohn, john@test.com, 555-0100\nJohn, john@test.com, 555-0100",
    "rules": ["all"]
  }'
```

## API Reference

### `POST /api/sanitize`

**Request body (JSON):**
```json
{
  "csv": "raw CSV text here",
  "rules": ["all"],
  "options": {
    "normalize": { "style": "snake_case" }
  }
}
```

**Alternative inputs:**
- `"file": "<base64>"` — base64-encoded CSV file
- Multipart form upload with `file` field

**Rules:** `"dedupe"`, `"whitespace"`, `"normalize"`, `"types"`, `"pii"`, `"all"`

**Response:**
```json
{
  "cleaned": "<base64>",
  "cleanedCsv": "clean CSV text",
  "headers": ["name", "email", "phone"],
  "stats": { ... },
  "warnings": [...],
  "remaining": 997,
  "mode": "free"
}
```

### `GET /api/health`

Health check endpoint.

### Authentication

Free tier: 3 calls/day/IP (no key required).

Paid: Include `Authorization: Bearer csv_YOUR_API_KEY` header.

## Pricing

| Plan | Price | Calls/month |
|------|-------|-------------|
| Starter | $9/mo | 1,000 |
| Pro | $29/mo | 5,000 |
| Business | $79/mo | 30,000 |

All plans include a 7-day free trial.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 16 + TypeScript + Tailwind CSS 4
- Vercel serverless deployment
- Paddle for payments
- HMAC self-signed API keys (zero database)

## License

MIT
# CSVSanitizer
