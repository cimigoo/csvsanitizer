import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "CSVSanitizer",
    version: "1.0.0-mvp",
    timestamp: new Date().toISOString(),
  });
}

