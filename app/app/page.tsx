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
    <main className="network-entry"><Link href="/" className="landing-brand" aria-label="CoSign home"><BrandMark /><strong>CoSign</strong></Link><section><span className="eyebrow">Choose a network</span><h1>Where does your wallet live?</h1><p>Pick the network both wallets can sign on. Cards stay on the network you choose and are never mirrored automatically.</p><div className="entry-grid"><Link href="/app/celo"><Smartphone /><span>Celo</span><strong>MiniPay-ready</strong><ArrowRight /></Link><Link href="/app/stacks"><WalletCards /><span>Stacks</span><strong>Bitcoin-secured</strong><ArrowRight /></Link></div></section></main>
  );
}
