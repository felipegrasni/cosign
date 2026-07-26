import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "CoSign link not found",
  description: "Recover from an incomplete or unpublished CoSign invitation or receipt link by choosing the shared network again.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true
    }
  }
};

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <Link href="/" className="not-found-brand" aria-label="Return to the CoSign home page">
        <BrandMark />
        <span className="sr-only">CoSign home</span>
      </Link>
      <span className="eyebrow">Signal lost</span>
      <h1>This CoSign link is not available.</h1>
      <p>The invitation or receipt link may be incomplete, missing characters, or point to a card that was never published on this network. If someone shared it in chat, ask them to resend the full link or let you scan their QR code again. Choose the shared network again to recover with a valid CoSign link.</p>
      <div className="not-found-actions">
        <Link className="button" href="/app" aria-label="Choose the shared CoSign network to recover from a missing link">
          Choose shared network <ArrowRight aria-hidden="true" />
        </Link>
        <Link className="button secondary" href="/app/celo" aria-label="Choose the Celo CoSign network to recover from a missing link">
          Choose Celo
        </Link>
        <Link className="button secondary" href="/app/stacks" aria-label="Choose the Stacks CoSign network to recover from a missing link">
          Choose Stacks
        </Link>
        <Link className="button secondary" href="/" aria-label="Return to the CoSign home page">
          Back to home
        </Link>
      </div>
    </main>
  );
}
