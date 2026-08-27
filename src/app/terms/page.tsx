import type { Metadata } from "next";
import { LegalLayout, Section } from "../privacy/page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms under which CSVSanitizer provides CSV data cleaning API services.",
};

const EFFECTIVE = "January 1, 2026";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" effective={EFFECTIVE}>
      <Section title="1. Acceptance of terms">
        These Terms of Service (&quot;Terms&quot;) govern your use of CSVSanitizer (the
        &quot;Service&quot;), operated by CSVSanitizer (&quot;we&quot;, &quot;us&quot;). By
        creating an account, purchasing a plan, or otherwise using the Service, you agree to be
        bound by these Terms. If you do not agree, please do not use the Service.
      </Section>

      <Section title="2. Description of service">
        CSVSanitizer is a web-based API that cleans, normalizes, and standardizes CSV data.
        Each paid plan grants a monthly number of API call credits. Credits reset monthly and
        do not roll over.
      </Section>

      <Section title="3. Eligibility">
        You must be at least 18 years old (or the age of majority in your jurisdiction) and
        able to form a binding contract. You represent that any information you provide during
        checkout is accurate.
      </Section>

      <Section title="4. Accounts & API keys">
        Access is managed via an API key that encodes your plan and credit balance. You are
        responsible for keeping your key confidential. You agree not to resell, redistribute,
        or share your key with third parties. We reserve the right to revoke keys used in
        violation of these Terms.
      </Section>

      <Section title="5. Acceptable use">
        You agree not to:
        <ul className="ml-5 mt-2 list-disc space-y-1">
          <li>Upload content that infringes or violates the rights of any third party.</li>
          <li>Upload illegal, harmful, or NSFW content.</li>
          <li>Attempt to reverse-engineer, abuse, or disrupt the Service.</li>
          <li>Use automated means to consume credits at a scale inconsistent with normal use.</li>
        </ul>
      </Section>

      <Section title="6. Your content & license">
        You retain ownership of data you submit and the cleaned outputs. You grant us a
        limited, non-exclusive, worldwide, royalty-free license to process your content solely
        to operate and improve the Service. We do not claim ownership of your content.
      </Section>

      <Section title="7. No AI guarantees">
        CSVSanitizer uses rule-based processing (not AI). We do not guarantee that cleaning
        results will be suitable for any particular purpose. You are solely responsible for
        reviewing cleaned data before using it in production pipelines.
      </Section>

      <Section title="8. Payments & taxes">
        Payments are processed by our merchant of record,{" "}
        <a className="text-emerald-600 underline" target="_blank" rel="noopener noreferrer" href="https://paddle.com/legal/buyer-terms/">Paddle</a>.
        Prices are shown in USD and may include applicable taxes/VAT collected by Paddle at
        checkout.
      </Section>

      <Section title="9. Refunds">
        Refunds are handled under our separate{" "}
        <a className="text-emerald-600 underline" href="/refunds">Refund Policy</a>.
      </Section>

      <Section title="10. Intellectual property">
        The CSVSanitizer name, logo, website, and underlying technology are owned by us and
        protected by intellectual property laws.
      </Section>

      <Section title="11. Disclaimers">
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
        WARRANTIES OF ANY KIND. WE DISCLAIM ALL IMPLIED WARRANTIES INCLUDING MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
      </Section>

      <Section title="12. Limitation of liability">
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL CSVSANITIZER BE LIABLE FOR
        ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL
        AGGREGATE LIABILITY SHALL NOT EXCEED THE AMOUNT YOU ACTUALLY PAID TO US IN THE 12
        MONTHS PRECEDING THE CLAIM.
      </Section>

      <Section title="13. Termination">
        You may stop using the Service at any time. We may suspend or terminate access if you
        materially breach these Terms.
      </Section>

      <Section title="14. Changes">
        We may update these Terms from time to time. Continued use after changes constitutes
        acceptance.
      </Section>

      <Section title="15. Governing law & contact">
        For any questions, contact{" "}
        <a className="text-emerald-600 underline" href="mailto:legal@csvsanitizer.com">legal@csvsanitizer.com</a>.
      </Section>
    </LegalLayout>
  );
}
