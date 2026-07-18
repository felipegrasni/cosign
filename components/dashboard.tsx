"use client";

import { useMemo, useState } from "react";
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
  const [tab, setTab] = useState<Tab>("created");
  const [wizard, setWizard] = useState(false);
  const [share, setShare] = useState<{ id: bigint; result: TransactionResult } | null>(null);
  const created = useHandshakeList(client.repository, client.account, "created");
  const signed = useHandshakeList(client.repository, client.account, "signed");
  const pending = useMemo(() => created.items.filter((item) => getStatus(item) === "pending"), [created.items]);
  const items = tab === "created" ? created.items : tab === "signed" ? signed.items : pending;
  const state = tab === "signed" ? signed : created;
  const tabPanelId = `dashboard-panel-${tab}`;
  const refreshing = created.loading || signed.loading;

  return (
    <AppShell network={network} account={client.account} connecting={client.connecting} isMiniPay={client.isMiniPay} onConnect={() => void client.connect()} onDisconnect={() => void client.disconnect()} onCreate={client.connected && client.repository.configured ? () => setWizard(true) : undefined}>
      <section className="dashboard-hero">
        <div><span className="eyebrow"><Signal size={16} aria-hidden="true" /> {network === "celo" ? "Celo signal room" : "Stacks signal room"}</span><h1>Your mutual moments.</h1><p>Create a public card, pass the link, and let the other wallet make it mutual.</p></div>
        {client.connected && client.repository.configured ? <button type="button" className="button hero-create" onClick={() => setWizard(true)}><Plus aria-hidden="true" /> Create a CoSign</button> : null}
      </section>

      {!client.repository.configured ? <section className="state-panel"><Signal aria-hidden="true" /><h2>Contract connection pending</h2><p>This {network === "celo" ? "Celo" : "Stacks"} route is ready for its deployed contract address. No demo records are shown here.</p></section> : !client.connected ? <section className="state-panel"><Wallet aria-hidden="true" /><h2>Bring your wallet</h2><p>Connect to create cards and see the moments tied to your address.</p>{client.isMiniPay ? <span role="status" aria-live="polite">Connecting MiniPay…</span> : <button type="button" className="button" onClick={() => void client.connect()}>Connect {network === "celo" ? "Celo" : "Stacks"} <ArrowRight aria-hidden="true" /></button>}</section> : <>
        <nav className="dashboard-tabs" aria-label="Card views" role="tablist">
          <button type="button" id="dashboard-tab-created" role="tab" className={tab === "created" ? "active" : ""} aria-selected={tab === "created"} aria-controls="dashboard-panel-created" aria-label={`Show created cards (${created.total})`} onClick={() => setTab("created")}>Created <span>{created.total}</span></button>
          <button type="button" id="dashboard-tab-signed" role="tab" className={tab === "signed" ? "active" : ""} aria-selected={tab === "signed"} aria-controls="dashboard-panel-signed" aria-label={`Show co-signed cards (${signed.total})`} onClick={() => setTab("signed")}>Co-signed <span>{signed.total}</span></button>
          <button type="button" id="dashboard-tab-pending" role="tab" className={tab === "pending" ? "active" : ""} aria-selected={tab === "pending"} aria-controls="dashboard-panel-pending" aria-label={`Show pending invitation cards (${pending.length})`} onClick={() => setTab("pending")}>Pending <span>{pending.length}</span></button>
          <button type="button" className="refresh-button" onClick={() => void Promise.all([created.refresh(), signed.refresh()])} aria-label={refreshing ? "Refreshing card lists" : "Refresh card lists"} aria-busy={refreshing} disabled={refreshing}>
            <RefreshCw size={17} aria-hidden="true" className={refreshing ? "is-spinning" : undefined} />
          </button>
        </nav>
        <div id={tabPanelId} role="tabpanel" aria-labelledby={`dashboard-tab-${tab}`}>
          {state.loading ? <section className="state-panel compact"><span className="loader" /><p>Listening for your cards…</p></section> : state.error ? <section className="state-panel compact"><Inbox aria-hidden="true" /><p>{state.error}</p><button type="button" className="button secondary" onClick={() => void state.refresh()}>Try again</button></section> : items.length ? <div className="card-grid">{items.map((item) => <HandshakeCard key={`${network}-${item.id}`} handshake={item} />)}</div> : <section className="empty-cards"><Inbox aria-hidden="true" /><h2>No cards here yet.</h2><p>{tab === "signed" ? "Cards you co-sign will collect here." : tab === "pending" ? "Invitations waiting for a co-sign will collect here." : "Create the first signal and invite someone in."}</p>{tab !== "signed" ? <button type="button" className="button" onClick={() => setWizard(true)}><Plus aria-hidden="true" /> Create a CoSign</button> : null}</section>}
        </div>
      </>}
      {wizard ? <CreateWizard network={network} account={client.account} repository={client.repository} onClose={() => setWizard(false)} onCreated={(id, result) => { setWizard(false); setShare({ id, result }); void created.refresh(); }} /> : null}
      {share ? <ShareSheet url={canonicalHandshakeUrl(publicEnv.appUrl, network, share.id)} explorerUrl={share.result.explorerUrl} onClose={() => setShare(null)} /> : null}
    </AppShell>
  );
}
