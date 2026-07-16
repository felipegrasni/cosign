"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Smartphone, WalletCards } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function AppEntryPage() {
  const router = useRouter();
  useEffect(() => {
    const ethereum = (window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum;
    if (ethereum?.isMiniPay) router.replace("/app/celo");
  }, [router]);
  return (
      <main id="main-content" className="network-entry"><Link href="/" className="landing-brand" aria-label="CoSign home"><BrandMark /><strong>CoSign</strong></Link><section><span className="eyebrow">Choose a network</span><h1>Where does your wallet live?</h1><p>Pick the one network both wallets can sign on. If the wallets live on different chains, create separate cards because CoSign never mirrors a receipt automatically.</p><div className="entry-grid"><Link href="/app/celo" aria-label="Open the Celo app. MiniPay-ready."><Smartphone aria-hidden="true" /><span>Celo</span><strong>MiniPay-ready</strong><ArrowRight aria-hidden="true" /></Link><Link href="/app/stacks" aria-label="Open the Stacks app. Bitcoin-secured."><WalletCards aria-hidden="true" /><span>Stacks</span><strong>Bitcoin-secured</strong><ArrowRight aria-hidden="true" /></Link></div></section></main>
  );
}
