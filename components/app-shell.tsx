"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Plus, Wallet } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { AddressGlyph } from "./address-glyph";
import { shortAddress } from "@/lib/cosign";
import type { Network } from "@/lib/types";
import type { ReactNode } from "react";

export function AppShell({ network, account, connecting, isMiniPay, onConnect, onDisconnect, onCreate, children }: {
  network: Network; account: string; connecting: boolean; isMiniPay: boolean;
  onConnect(): void; onDisconnect(): void; onCreate?(): void; children: ReactNode;
}) {
  const networkLabel = network === "celo" ? "Celo" : "Stacks";

  return (
    <div className="app-page">
      <header className="app-topbar">
        <Link href="/" className="app-brand" aria-label="CoSign home"><BrandMark /><strong>CoSign</strong></Link>
        <div className="app-actions">
          <details className="network-menu">
            <summary aria-label={`Choose network. Current network: ${networkLabel}.`}><span className={`network-dot ${network}`} aria-hidden="true" />{networkLabel}<ChevronDown size={15} aria-hidden="true" /></summary>
            <nav aria-label="Choose network">
              <Link href="/app/celo" aria-current={network === "celo" ? "page" : undefined} aria-label="Switch to the Celo network dashboard">Celo</Link>
              <Link href="/app/stacks" aria-current={network === "stacks" ? "page" : undefined} aria-label="Switch to the Stacks network dashboard">Stacks</Link>
            </nav>
          </details>
          {onCreate ? <button type="button" className="button compact" onClick={onCreate}><Plus size={17} aria-hidden="true" /> Create a CoSign</button> : null}
          {account ? (
            <details className="wallet-menu">
              <summary aria-label={`Open wallet menu for ${account}`} title={account}><AddressGlyph address={account} size={34} /><span>{shortAddress(account, 4)}</span></summary>
              <div role="group" aria-label="Wallet actions"><Link href={`/app/${network}/profile/${account}`} aria-label={`Open the ${networkLabel} public profile for ${account}`}>View public profile</Link><button type="button" onClick={onDisconnect} aria-label={`Disconnect ${account} from CoSign`}><LogOut size={15} aria-hidden="true" /> Disconnect wallet</button></div>
            </details>
          ) : isMiniPay ? <span className="connecting-note" role="status" aria-live="polite">Connecting MiniPay…</span> : (
            <button type="button" className="button secondary compact" onClick={onConnect} disabled={connecting} aria-busy={connecting} aria-label={connecting ? `Connecting ${networkLabel} wallet` : `Connect ${networkLabel} wallet`}>
              <Wallet size={17} aria-hidden="true" /> {connecting ? `Connecting ${networkLabel}…` : `Connect ${networkLabel}`}
            </button>
          )}
        </div>
      </header>
      <main id="main-content" className="app-main">{children}</main>
    </div>
  );
}
