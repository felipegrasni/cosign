import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "CoSign route not found",
  description: "Recover from an incomplete or unpublished CoSign invitation or receipt link by choosing a valid network route."
};

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <BrandMark />
      <span className="eyebrow">Signal lost</span>
      <h1>This CoSign route is not available.</h1>
      <p>The invitation or receipt link may be incomplete, missing characters, or point to a route that was never published on this network. Choose the network again to recover with a valid CoSign route.</p>
      <div className="not-found-actions">
        <Link className="button" href="/app" aria-label="Choose a CoSign network to recover from a missing link">
          <ArrowLeft aria-hidden="true" /> Choose network
        </Link>
        <Link className="button secondary" href="/" aria-label="Return to the CoSign home page">
          Back to home
        </Link>
      </div>
    </main>
  );
}
