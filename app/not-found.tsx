import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "CoSign link not found on this network",
  description: "Recover from a CoSign invitation or receipt link that opened on the wrong network, then reopen the public link directly once Celo or Stacks is correct.",
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
    <main id="main-content" className="not-found" tabIndex={-1}>
      <Link href="/" className="not-found-brand" aria-label="Return to the CoSign home page">
        <BrandMark />
        <span className="sr-only">CoSign home</span>
      </Link>
      <span className="eyebrow">Signal lost</span>
      <h1>This CoSign link is not available on this network.</h1>
      <p>The invitation or receipt link may have opened on the wrong network, lost characters, been copied incompletely, or point to a card that was never published here.</p>
      <p>After you switch to the correct network, reopen the public invitation or receipt link directly. Use <Link href="/app">the shared network chooser</Link> only when both wallets still need to choose the same network before creating or co-signing.</p>
      <ul className="not-found-guidance" aria-label="How to recover from a missing CoSign page">
        <li><strong>Try the full link again:</strong> ask for the original message or rescan the QR code instead of retyping the URL.</li>
        <li><strong>Check the network first:</strong> open <Link href="/app/celo">Celo</Link> or <Link href="/app/stacks">Stacks</Link> before reopening the invitation or receipt.</li>
        <li><strong>Still missing?</strong> The card may never have been published on this network.</li>
      </ul>
      <div className="not-found-actions">
        <Link className="button" href="/app" aria-label="Choose Celo or Stacks as the shared network to recover from a missing link">
          Choose a shared network <ArrowRight aria-hidden="true" />
        </Link>
        <Link className="button secondary" href="/app/celo" aria-label="Open the Celo CoSign network to recover from a missing link">
          Open Celo
        </Link>
        <Link className="button secondary" href="/app/stacks" aria-label="Open the Stacks CoSign network to recover from a missing link">
          Open Stacks
        </Link>
        <Link className="button secondary" href="/" aria-label="Return to the CoSign home page">
          Back to home
        </Link>
      </div>
    </main>
  );
}
