"use client";

import { useEffect, useId } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Smartphone, WalletCards } from "lucide-react";
import { BrandMark } from "./brand-mark";

export function AppEntryPage() {
  const router = useRouter();
  const redirectingToMiniPay = typeof window !== "undefined" && Boolean((window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay);
  const chooserId = useId();
  const celoTitleId = `${chooserId}-celo-title`;
  const celoBadgeId = `${chooserId}-celo-badge`;
  const celoDescriptionId = `${chooserId}-celo-description`;
  const stacksTitleId = `${chooserId}-stacks-title`;
  const stacksBadgeId = `${chooserId}-stacks-badge`;
  const stacksDescriptionId = `${chooserId}-stacks-description`;

  useEffect(() => {
    if (redirectingToMiniPay) router.replace("/app/celo");
  }, [redirectingToMiniPay, router]);

  return (
    <main id="main-content" className="network-entry" tabIndex={-1}>
      <Link href="/" className="landing-brand" aria-label="CoSign home">
        <BrandMark />
        <strong>CoSign</strong>
      </Link>
      <section>
        <span className="eyebrow">Choose a shared network</span>
        <h1>Which shared network will both wallets use?</h1>
        <p>Pick the one network both wallets can use before creating a card or co-signing an invitation.</p>
        <ul className="entry-guidance" aria-label="Before you choose a network">
          <li><strong>Public by link:</strong> anyone can read a shared card without connecting a wallet.</li>
          <li><strong>Same network required:</strong> creating and co-signing only work when both wallets use the network you choose.</li>
        </ul>
        <p>Existing public invitation and receipt links still open directly on their original network. Use this chooser only when both wallets are about to create a new card or co-sign on the same network.</p>
        <p>Each CoSign card stays on the network where it was created. If the wallets live on different networks, create one card on each network because CoSign does not carry the same receipt across networks.</p>
        {redirectingToMiniPay ? (
          <>
            <p className="entry-note" role="status" aria-live="polite">MiniPay detected. Opening Celo…</p>
            <p><Link href="/app/celo">Open Celo manually instead</Link></p>
          </>
        ) : (
          <ul className="entry-grid" aria-label="Available CoSign networks">
            <li>
              <Link href="/app/celo" aria-labelledby={`${celoTitleId} ${celoBadgeId}`} aria-describedby={celoDescriptionId}>
                <Smartphone aria-hidden="true" />
                <span id={celoTitleId}>Celo</span>
                <strong id={celoBadgeId}>MiniPay-ready</strong>
                <p id={celoDescriptionId}>Best when both wallets will sign with MiniPay or another Celo wallet. MiniPay opens this route automatically.</p>
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link href="/app/stacks" aria-labelledby={`${stacksTitleId} ${stacksBadgeId}`} aria-describedby={stacksDescriptionId}>
                <WalletCards aria-hidden="true" />
                <span id={stacksTitleId}>Stacks</span>
                <strong id={stacksBadgeId}>Bitcoin-secured</strong>
                <p id={stacksDescriptionId}>Best when both wallets already use a Stacks wallet on the same network.</p>
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
          </ul>
        )}
      </section>
    </main>
  );
}
