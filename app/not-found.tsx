import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return <main id="main-content" className="not-found"><BrandMark /><span className="eyebrow">Signal lost</span><h1>This CoSign route is not available.</h1><p>The invite or receipt link may be incomplete, copied with missing characters, or point to a route that was never published on this network. Start again from the network chooser to open a valid CoSign route.</p><Link className="button" href="/app" aria-label="Open the CoSign network chooser to recover from a missing link"><ArrowLeft aria-hidden="true" /> Open network chooser</Link></main>;
}
