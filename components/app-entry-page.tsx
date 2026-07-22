"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Smartphone, WalletCards } from "lucide-react";
import { BrandMark } from "./brand-mark";

export function AppEntryPage() {
  const router = useRouter();
  const redirectingToMiniPay = typeof window !== "undefined" && Boolean((window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay);
  const celoTitleId = "network-option-celo-title";
  const celoDescriptionId = "network-option-celo-description";
  const stacksTitleId = "network-option-stacks-title";
  const stacksDescriptionId = "network-option-stacks-description";

  useEffect(() => {
    if (redirectingToMiniPay) router.replace("/app/celo");
  }, [redirectingToMiniPay, router]);

  return (
    <main id="main-content" className="network-entry">
      <Link href="/" className="landing-brand" aria-label="CoSign home">
        <BrandMark />
        <strong>CoSign</strong>
      </Link>
      <section>
        <span className="eyebrow">Choose a network</span>
        <h1>Which network will both wallets use?</h1>
        <p>Pick the one chain both wallets can sign on. Public cards stay readable without connecting, but creating or co-signing needs a wallet on the selected network. If the wallets live on different networks, create separate cards because CoSign does not mirror receipts across chains.</p>
        {redirectingToMiniPay ? <p className="entry-note" role="status" aria-live="polite">MiniPay detected. Opening Celo…</p> : null}
        <div className="entry-grid" role="list" aria-label="Available CoSign networks">
          <Link href="/app/celo" role="listitem" aria-labelledby={celoTitleId} aria-describedby={celoDescriptionId}>
            <Smartphone aria-hidden="true" />
            <span id={celoTitleId}>Celo</span>
            <strong>MiniPay-ready</strong>
            <p id={celoDescriptionId}>Best when both wallets will sign with MiniPay or another Celo wallet. MiniPay opens this route automatically.</p>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/app/stacks" role="listitem" aria-labelledby={stacksTitleId} aria-describedby={stacksDescriptionId}>
            <WalletCards aria-hidden="true" />
            <span id={stacksTitleId}>Stacks</span>
            <strong>Bitcoin-secured</strong>
            <p id={stacksDescriptionId}>Best when both wallets already use a Stacks wallet for this shared receipt.</p>
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
