import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CSVSanitizer — CSV Data Cleaning & Standardization API",
    template: "%s | CSVSanitizer",
  },
  description:
    "Clean, deduplicate, normalize and standardize CSV data with a single API call. Zero data retention, pure rules, CI/CD friendly.",
  keywords: [
    "CSV cleaning API",
    "CSV deduplication",
    "data normalization",
    "PII detection",
    "CSV sanitizer",
    "data pipeline",
  ],
  openGraph: {
    title: "CSVSanitizer — CSV Data Cleaning & Standardization API",
    description:
      "Clean, deduplicate, normalize and standardize CSV data with a single API call. Zero data retention.",
    type: "website",
    url: "https://csvsanitizer.vercel.app",
    siteName: "CSVSanitizer",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CSVSanitizer — CSV Data Cleaning API",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CSVSanitizer — CSV Data Cleaning & Standardization API",
    description: "Clean, deduplicate, normalize and standardize CSV data with a single API call.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
