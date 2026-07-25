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
    <main id="main-content" className="network-entry">
      <Link href="/" className="landing-brand" aria-label="CoSign home">
        <BrandMark />
        <strong>CoSign</strong>
      </Link>
      <section>
        <span className="eyebrow">Choose a network</span>
        <h1>Which network will both wallets use?</h1>
        <p>Pick the one network both wallets can actually sign on.</p>
        <p>Public cards stay readable without connecting a wallet, but creating or co-signing only works on the network you choose. If the wallets live on different networks, create separate cards because CoSign does not carry the same receipt across networks.</p>
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
                <p id={stacksDescriptionId}>Best when both wallets already use a Stacks wallet for this shared receipt.</p>
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
          </ul>
        )}
      </section>
    </main>
  );
}
