"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface KeyData {
  apiKey: string;
  email: string;
  plan: string;
  credits: number;
}

function SuccessInner() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("checkout_id") || searchParams.get("transaction_id") || searchParams.get("ref") || "";

  const [data, setData] = useState<KeyData | null>(null);
  const [pending, setPending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!reference) return;
    let tries = 0;
    setPending(true);
    const poll = async () => {
      tries += 1;
      try {
        const res = await fetch(`/api/retrieve-key?reference=${encodeURIComponent(reference)}`);
        if (res.ok) {
          const json = (await res.json()) as KeyData;
          setData(json);
          setPending(false);
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (tries >= 12) {
          setNotFound(true); setPending(false);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        if (tries >= 12) { setNotFound(true); setPending(false); if (pollRef.current) clearInterval(pollRef.current); }
      }
    };
    poll();
    pollRef.current = setInterval(poll, 2500);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [reference]);

  const copyKey = async () => {
    if (!data) return;
    try { await navigator.clipboard.writeText(data.apiKey); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  };

  const goToApp = () => { if (data) localStorage.setItem("csv_api_key", data.apiKey); };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-8 py-10 text-center text-white">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/20 text-3xl">🎉</div>
          <h1 className="mt-5 text-3xl font-extrabold">Payment successful!</h1>
          <p className="mt-2 text-emerald-100">Welcome to CSVSanitizer. Your API key is below.</p>
        </div>
        <div className="space-y-6 p-8">
          {pending && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
              <p className="text-sm font-semibold text-emerald-900">Confirming your purchase with Paddle…</p>
              <p className="mt-1 text-xs text-emerald-700">This usually takes a few seconds.</p>
            </div>
          )}
          {notFound && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              <p className="font-semibold">We couldn't auto-retrieve your key.</p>
              <p className="mt-1">Your key has been generated. If it doesn't arrive within 5 minutes, contact{" "}
                <a className="underline" href="mailto:hello@csvsanitizer.com">hello@csvsanitizer.com</a>.
              </p>
            </div>
          )}
          {data && (
            <>
              <div><p className="text-sm text-slate-500">Plan</p><p className="text-lg font-bold capitalize text-slate-900">{data.plan} · {data.credits} calls/month</p></div>
              <div>
                <p className="text-sm text-slate-500">Your API key</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <code className="flex-1 break-all rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-800">{data.apiKey}</code>
                  <button type="button" onClick={copyKey} className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">{copied ? "Copied!" : "Copy"}</button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Store this key safely — it's the only copy.</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">How to use your key</p>
                <ol className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>1. Open the <Link href="/app" className="font-semibold text-emerald-600">CSVSanitizer Playground</Link>.</li>
                  <li>2. Paste the key into the <strong>API key</strong> field. It's saved in your browser.</li>
                  <li>3. Upload a CSV, select rules, click <strong>Sanitize CSV</strong>.</li>
                  <li>4. Each call uses 1 credit. Your balance updates automatically.</li>
                </ol>
              </div>
              <Link href="/app" onClick={goToApp} className="block w-full rounded-xl bg-emerald-600 px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
                Go to the Playground →
              </Link>
            </>
          )}
          {!reference && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <p>No purchase reference found in the URL. Need help? Email{" "}
                <a className="underline" href="mailto:hello@csvsanitizer.com">hello@csvsanitizer.com</a>.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← Back to home</Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense fallback={<div className="p-10 text-center">Loading…</div>}><SuccessInner /></Suspense>;
}
