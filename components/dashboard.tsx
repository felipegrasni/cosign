"use client";

import { useId, useMemo, useState } from "react";
import { ArrowRight, Inbox, Plus, RefreshCw, Signal, Wallet } from "lucide-react";
import { AppShell } from "./app-shell";
import { CreateWizard } from "./create-wizard";
import { HandshakeCard } from "./handshake-card";
import { ShareSheet } from "./share-sheet";
import { useHandshakeList } from "./use-handshakes";
import { useNetworkClient } from "./network-client";
import { canonicalHandshakeUrl, getStatus } from "@/lib/cosign";
import { publicEnv } from "@/lib/env";
import type { Network, TransactionResult } from "@/lib/types";

type Tab = "created" | "signed" | "pending";

export function Dashboard({ network }: { network: Network }) {
  const client = useNetworkClient(network);
  const idPrefix = useId();
  const [tab, setTab] = useState<Tab>("created");
  const [wizard, setWizard] = useState(false);
  const [share, setShare] = useState<{ id: bigint; result: TransactionResult } | null>(null);
  const created = useHandshakeList(client.repository, client.account, "created");
  const signed = useHandshakeList(client.repository, client.account, "signed");
  const pending = useMemo(() => created.items.filter((item) => getStatus(item) === "pending"), [created.items]);
  const items = tab === "created" ? created.items : tab === "signed" ? signed.items : pending;
  const state = tab === "signed" ? signed : created;
  const createdTabId = `${idPrefix}-dashboard-tab-created`;
  const signedTabId = `${idPrefix}-dashboard-tab-signed`;
  const pendingTabId = `${idPrefix}-dashboard-tab-pending`;
  const createdPanelId = `${idPrefix}-dashboard-panel-created`;
  const signedPanelId = `${idPrefix}-dashboard-panel-signed`;
  const pendingPanelId = `${idPrefix}-dashboard-panel-pending`;
  const tabPanelId = tab === "created" ? createdPanelId : tab === "signed" ? signedPanelId : pendingPanelId;
  const activeTabId = tab === "created" ? createdTabId : tab === "signed" ? signedTabId : pendingTabId;
  const refreshing = created.loading || signed.loading;

  return (
    <AppShell network={network} account={client.account} connecting={client.connecting} isMiniPay={client.isMiniPay} onConnect={() => void client.connect()} onDisconnect={() => void client.disconnect()} onCreate={client.connected && client.repository.configured ? () => setWizard(true) : undefined}>
      <section className="dashboard-hero">
        <div><span className="eyebrow"><Signal size={16} aria-hidden="true" /> {network === "celo" ? "Celo signal room" : "Stacks signal room"}</span><h1>Your mutual moments.</h1><p>Create a public card, pass the link, and let the other wallet make it mutual.</p></div>
        {client.connected && client.repository.configured ? <button type="button" className="button hero-create" onClick={() => setWizard(true)}><Plus aria-hidden="true" /> Create a CoSign</button> : null}
      </section>

      {!client.repository.configured ? <section className="state-panel"><Signal aria-hidden="true" /><h2>Contract connection pending</h2><p>This {network === "celo" ? "Celo" : "Stacks"} route is ready for its deployed contract address. No demo records are shown here.</p></section> : !client.connected ? <section className="state-panel"><Wallet aria-hidden="true" /><h2>Bring your wallet</h2><p>Connect to create cards and see the moments tied to your address. Public cards still open by link without connecting.</p>{client.isMiniPay ? <span role="status" aria-live="polite">Connecting MiniPay…</span> : <button type="button" className="button" onClick={() => void client.connect()} disabled={client.connecting} aria-busy={client.connecting} aria-label={client.connecting ? `Connecting ${network === "celo" ? "Celo" : "Stacks"} wallet` : `Connect ${network === "celo" ? "Celo" : "Stacks"} wallet`}>{client.connecting ? `Connecting ${network === "celo" ? "Celo" : "Stacks"}…` : `Connect ${network === "celo" ? "Celo" : "Stacks"}`} <ArrowRight aria-hidden="true" /></button>}</section> : <>
        <div className="dashboard-tabs">
          <nav className="dashboard-tablist" aria-label="Card views" role="tablist">
            <button type="button" id={createdTabId} role="tab" className={tab === "created" ? "active" : ""} aria-selected={tab === "created"} aria-controls={createdPanelId} aria-label={`Show created cards (${created.total})`} onClick={() => setTab("created")}>Created <span>{created.total}</span></button>
            <button type="button" id={signedTabId} role="tab" className={tab === "signed" ? "active" : ""} aria-selected={tab === "signed"} aria-controls={signedPanelId} aria-label={`Show co-signed cards (${signed.total})`} onClick={() => setTab("signed")}>Co-signed <span>{signed.total}</span></button>
            <button type="button" id={pendingTabId} role="tab" className={tab === "pending" ? "active" : ""} aria-selected={tab === "pending"} aria-controls={pendingPanelId} aria-label={`Show invitations awaiting a co-signature (${pending.length})`} onClick={() => setTab("pending")}>Awaiting co-sign <span>{pending.length}</span></button>
          </nav>
          <button type="button" className="refresh-button" onClick={() => void Promise.all([created.refresh(), signed.refresh()])} aria-label={refreshing ? "Refreshing card lists" : "Refresh card lists"} aria-busy={refreshing} disabled={refreshing}>
            <RefreshCw size={17} aria-hidden="true" className={refreshing ? "is-spinning" : undefined} />
            <span className="refresh-button-label">{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </div>
        <div id={tabPanelId} role="tabpanel" aria-labelledby={activeTabId}>
          {state.loading ? <section className="state-panel compact" role="status" aria-live="polite"><span className="loader" /><p>{tab === "pending" ? "Listening for invitations awaiting a co-signature…" : "Listening for your cards…"}</p></section> : state.error ? <section className="state-panel compact"><Inbox aria-hidden="true" /><p>{state.error}</p><button type="button" className="button secondary" onClick={() => void state.refresh()} aria-label={`Reload the ${tab === "signed" ? "co-signed" : tab === "pending" ? "awaiting co-sign" : "created"} card list`}>Reload cards</button></section> : items.length ? <div className="card-grid">{items.map((item) => <HandshakeCard key={`${network}-${item.id}`} handshake={item} />)}</div> : <section className="empty-cards"><Inbox aria-hidden="true" /><h2>{tab === "signed" ? "No co-signed cards yet." : tab === "pending" ? "No invitations awaiting a co-sign yet." : "No created cards yet."}</h2><p>{tab === "signed" ? "Cards you co-sign will collect here." : tab === "pending" ? "Invitations still waiting for the other wallet will collect here." : "Create the first signal and invite someone in."}</p>{tab !== "signed" ? <button type="button" className="button" onClick={() => setWizard(true)}><Plus aria-hidden="true" /> Create a CoSign</button> : null}</section>}
        </div>
      </>}
      {wizard ? <CreateWizard network={network} account={client.account} repository={client.repository} onClose={() => setWizard(false)} onCreated={(id, result) => { setWizard(false); setShare({ id, result }); void created.refresh(); }} /> : null}
      {share ? <ShareSheet url={canonicalHandshakeUrl(publicEnv.appUrl, network, share.id)} explorerUrl={share.result.explorerUrl} onClose={() => setShare(null)} /> : null}
    </AppShell>
  );
}
