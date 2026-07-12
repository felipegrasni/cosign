import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return <main className="not-found"><BrandMark /><span className="eyebrow">Signal lost</span><h1>This page is not part of the connection.</h1><Link className="button" href="/"><ArrowLeft /> Back home</Link></main>;
}
