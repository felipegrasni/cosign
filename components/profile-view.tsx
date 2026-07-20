"use client";

import { ArrowLeft, ArrowRight, Inbox } from "lucide-react";
import Link from "next/link";
import { AddressGlyph } from "./address-glyph";
import { AppShell } from "./app-shell";
import { HandshakeCard } from "./handshake-card";
import { useHandshakeList } from "./use-handshakes";
import { useNetworkClient } from "./network-client";
import { shortAddress } from "@/lib/cosign";
import type { Network } from "@/lib/types";

export function ProfileView({ network, address }: { network: Network; address: string }) {
  const client = useNetworkClient(network);
  const created = useHandshakeList(client.repository, address, "created");
  const signed = useHandshakeList(client.repository, address, "signed");
  const networkLabel = network === "celo" ? "Celo" : "Stacks";
  return (
    <AppShell network={network} account={client.account} connecting={client.connecting} isMiniPay={client.isMiniPay} onConnect={() => void client.connect()} onDisconnect={() => void client.disconnect()}>
      <Link className="back-link" href={`/app/${network}`} aria-label={`Back to the ${networkLabel} cards dashboard`}><ArrowLeft size={17} aria-hidden="true" /> Back to cards</Link>
      <section className="profile-head"><AddressGlyph address={address} size={76} /><div><span className="eyebrow">Public wallet history · {networkLabel}</span><h1 aria-label={`Wallet address ${address}`} title={address}>{shortAddress(address, 8)}</h1><p>{created.total} created · {signed.total} co-signed</p></div></section>
      {!client.repository.configured ? <section className="state-panel"><Inbox aria-hidden="true" /><h2>Contract connection pending</h2><p>This public profile needs the deployed {networkLabel} contract address before wallet history can load.</p></section> : <div className="profile-columns"><section><header><h2>Created</h2><span>{created.total}</span></header>{created.loading ? <div className="state-panel compact" role="status" aria-live="polite"><span className="loader" /><p>Loading created cards…</p></div> : created.items.length ? <><div className="card-stack">{created.items.map((item) => <HandshakeCard key={item.id} handshake={item} />)}</div><Pagination previous={created.hasPrevious} next={created.hasNext} onPrevious={() => created.setPage(created.page - 1)} onNext={() => created.setPage(created.page + 1)} /></> : <div className="empty-mini">No public cards created.</div>}</section><section><header><h2>Co-signed</h2><span>{signed.total}</span></header>{signed.loading ? <div className="state-panel compact" role="status" aria-live="polite"><span className="loader" /><p>Loading co-signed cards…</p></div> : signed.items.length ? <><div className="card-stack">{signed.items.map((item) => <HandshakeCard key={item.id} handshake={item} />)}</div><Pagination previous={signed.hasPrevious} next={signed.hasNext} onPrevious={() => signed.setPage(signed.page - 1)} onNext={() => signed.setPage(signed.page + 1)} /></> : <div className="empty-mini">No public cards co-signed.</div>}</section></div>}
    </AppShell>
  );
}

function Pagination({ previous, next, onPrevious, onNext }: { previous: boolean; next: boolean; onPrevious(): void; onNext(): void }) {
  if (!previous && !next) return null;
  return <nav className="pagination" aria-label="Profile history pages"><button type="button" disabled={!previous} onClick={onPrevious} aria-label="Show newer wallet history cards"><ArrowLeft aria-hidden="true" /> Newer</button><button type="button" disabled={!next} onClick={onNext} aria-label="Show older wallet history cards">Older <ArrowRight aria-hidden="true" /></button></nav>;
}
