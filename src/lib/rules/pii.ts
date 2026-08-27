export interface PiiColumn {
  column: string;
  piiType: "email" | "phone" | "ssn" | "credit_card" | "address" | "ip_address";
  confidence: number;
  sampleValues: string[];
}

export interface PiiResult {
  piiColumns: PiiColumn[];
  totalFlaggedCells: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\+]?[\d\s\-\(\)]{7,20}$/;
// US SSN pattern: XXX-XX-XXXX
const SSN_RE = /^\d{3}-\d{2}-\d{4}$/;
// CN ID card: 18 digits (last may be X)
const CN_ID_RE = /^\d{17}[\dXx]$/;
const CREDIT_CARD_RE = /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/;
const IPV4_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const ADDRESS_KEYWORDS = /(address|addr|street|city|state|zip|postal|country|region|province)/i;
const ADDRESS_NUMBER_RE = /^\d+\s+[A-Za-z\s]+(St|Street|Ave|Avenue|Blvd|Road|Rd|Drive|Dr|Lane|Way|Court|Ct|Place|Pl)$/i;

function detectPii(header: string, values: string[]): PiiColumn | null {
  const nonEmpty = values.filter((v) => v.trim() !== "");
  if (nonEmpty.length === 0) return null;

  const sample = nonEmpty.slice(0, Math.min(100, nonEmpty.length));
  const samples5 = sample.slice(0, 5);

  // Check by header name first
  if (ADDRESS_KEYWORDS.test(header)) {
    return {
      column: header,
      piiType: "address",
      confidence: 0.7,
      sampleValues: samples5,
    };
  }

  // Check email
  const emailMatch = sample.filter((v) => EMAIL_RE.test(v.trim())).length;
  if (emailMatch / sample.length >= 0.7) {
    return {
      column: header,
      piiType: "email",
      confidence: Math.round((emailMatch / sample.length) * 100) / 100,
      sampleValues: samples5,
    };
  }

  // Check phone
  const phoneMatch = sample.filter((v) => PHONE_RE.test(v.trim())).length;
  if (phoneMatch / sample.length >= 0.7) {
    return {
      column: header,
      piiType: "phone",
      confidence: Math.round((phoneMatch / sample.length) * 100) / 100,
      sampleValues: samples5,
    };
  }

  // Check SSN
  const ssnMatch = sample.filter((v) => SSN_RE.test(v.trim())).length;
  if (ssnMatch / sample.length >= 0.5) {
    return {
      column: header,
      piiType: "ssn",
      confidence: Math.round((ssnMatch / sample.length) * 100) / 100,
      sampleValues: samples5,
    };
  }

  // Check CN ID
  const cnIdMatch = sample.filter((v) => CN_ID_RE.test(v.trim())).length;
  if (cnIdMatch / sample.length >= 0.5) {
    return {
      column: header,
      piiType: "ssn",
      confidence: Math.round((cnIdMatch / sample.length) * 100) / 100,
      sampleValues: samples5,
    };
  }

  // Check credit card
  const ccMatch = sample.filter((v) => CREDIT_CARD_RE.test(v.trim())).length;
  if (ccMatch / sample.length >= 0.5) {
    return {
      column: header,
      piiType: "credit_card",
      confidence: Math.round((ccMatch / sample.length) * 100) / 100,
      sampleValues: samples5,
    };
  }

  // Check IP address
  const ipMatch = sample.filter((v) => IPV4_RE.test(v.trim())).length;
  if (ipMatch / sample.length >= 0.7) {
    return {
      column: header,
      piiType: "ip_address",
      confidence: Math.round((ipMatch / sample.length) * 100) / 100,
      sampleValues: samples5,
    };
  }

  return null;
}

export function applyPiiDetection(
  headers: string[],
  rows: string[][]
): PiiResult {
  const piiColumns: PiiColumn[] = [];
  let totalFlaggedCells = 0;

  headers.forEach((header, colIndex) => {
    const values = rows.map((row) => row[colIndex] || "");
    const pii = detectPii(header, values);
    if (pii) {
      piiColumns.push(pii);
      totalFlaggedCells += values.filter((v) => v.trim() !== "").length;
    }
  });

  return { piiColumns, totalFlaggedCells };
}
