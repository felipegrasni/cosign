"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Smartphone, WalletCards } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function AppEntryPage() {
  const router = useRouter();
  const redirectingToMiniPay = typeof window !== "undefined" && Boolean((window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay);

  useEffect(() => {
    if (redirectingToMiniPay) router.replace("/app/celo");
  }, [redirectingToMiniPay, router]);
  return (
      <main id="main-content" className="network-entry"><Link href="/" className="landing-brand" aria-label="CoSign home"><BrandMark /><strong>CoSign</strong></Link><section><span className="eyebrow">Choose a network</span><h1>Which network will both wallets use?</h1><p>Pick the one chain both wallets can sign on. If the wallets live on different networks, create separate cards because CoSign does not mirror receipts across chains.</p>{redirectingToMiniPay ? <p className="entry-note" role="status" aria-live="polite">MiniPay detected. Opening Celo…</p> : null}<div className="entry-grid"><Link href="/app/celo" aria-label="Open the Celo app. MiniPay-ready."><Smartphone aria-hidden="true" /><span>Celo</span><strong>MiniPay-ready</strong><ArrowRight aria-hidden="true" /></Link><Link href="/app/stacks" aria-label="Open the Stacks app. Bitcoin-secured."><WalletCards aria-hidden="true" /><span>Stacks</span><strong>Bitcoin-secured</strong><ArrowRight aria-hidden="true" /></Link></div></section></main>
  );
}
