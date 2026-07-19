import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return <main id="main-content" className="not-found"><BrandMark /><span className="eyebrow">Signal lost</span><h1>This page could not be found.</h1><p>The link may be incomplete, expired, or moved. Start again by choosing the network both wallets will use.</p><Link className="button" href="/app" aria-label="Back to the network chooser for both wallets"><ArrowLeft aria-hidden="true" /> Back to network chooser</Link></main>;
}
