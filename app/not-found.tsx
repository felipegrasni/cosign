import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return <main className="not-found"><BrandMark /><span className="eyebrow">Signal lost</span><h1>This page could not be found.</h1><p>The link may be incomplete, expired, or moved. Start again from the CoSign home page.</p><Link className="button" href="/"><ArrowLeft /> Back to home page</Link></main>;
}
