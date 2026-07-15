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
  return (
    <div className="app-page">
      <header className="app-topbar">
        <Link href="/" className="app-brand" aria-label="CoSign home"><BrandMark /><strong>CoSign</strong></Link>
        <div className="app-actions">
          <details className="network-menu">
            <summary><span className={`network-dot ${network}`} aria-hidden="true" />{network === "celo" ? "Celo" : "Stacks"}<ChevronDown size={15} aria-hidden="true" /></summary>
            <div><Link href="/app/celo">Celo</Link><Link href="/app/stacks">Stacks</Link></div>
          </details>
          {onCreate ? <button type="button" className="button compact" onClick={onCreate}><Plus size={17} aria-hidden="true" /> New</button> : null}
          {account ? (
            <details className="wallet-menu">
              <summary><AddressGlyph address={account} size={34} /><span>{shortAddress(account, 4)}</span></summary>
              <div><Link href={`/app/${network}/profile/${account}`}>Public profile</Link><button type="button" onClick={onDisconnect}><LogOut size={15} aria-hidden="true" /> Disconnect</button></div>
            </details>
          ) : isMiniPay ? <span className="connecting-note">Connecting MiniPay…</span> : (
            <button type="button" className="button secondary compact" onClick={onConnect} disabled={connecting}><Wallet size={17} aria-hidden="true" /> {connecting ? "Connecting" : "Connect"}</button>
          )}
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
