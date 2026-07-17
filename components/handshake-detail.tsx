"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Ban, Check, Clock3, ExternalLink, RefreshCw, Share2, UserRoundX } from "lucide-react";
import Link from "next/link";
import { AppShell } from "./app-shell";
import { AddressGlyph } from "./address-glyph";
import { CategoryIcon } from "./category-icon";
import { ShareSheet } from "./share-sheet";
import { useNetworkClient } from "./network-client";
import { canonicalHandshakeUrl, formatMoment, getStatus, kindLabel, shortAddress } from "@/lib/cosign";
import { contractExplorerUrl, publicEnv, txExplorerUrl } from "@/lib/env";
import type { Handshake, Network, TransactionState } from "@/lib/types";

export function HandshakeDetail({ network, id }: { network: Network; id: bigint }) {
  const client = useNetworkClient(network);
  const [card, setCard] = useState<Handshake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState<"" | "cosign" | "cancel">("");
  const [message, setMessage] = useState("");
  const [share, setShare] = useState(false);
  const [lastTx, setLastTx] = useState("");
  const [transaction, setTransaction] = useState<TransactionState>({ phase: "idle", message: "" });

  const load = useCallback(async () => {
    if (!client.repository.configured) { setLoading(false); return; }
    setLoading(true); setError("");
    try { setCard(await client.repository.getHandshake(id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not read this CoSign."); }
    finally { setLoading(false); }
  }, [client.repository, id]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const status = card ? getStatus(card) : null;
  const same = (a?: string | null, b?: string | null) => Boolean(a && b && a.toLowerCase() === b.toLowerCase());
  const isCreator = card ? same(card.creator, client.account) : false;
  const eligible = card && status === "pending" && client.account && !isCreator && (!card.intendedSigner || same(card.intendedSigner, client.account));
  const wrongWallet = card && status === "pending" && client.account && card.intendedSigner && !same(card.intendedSigner, client.account) && !isCreator;

  const act = async (kind: "cosign" | "cancel") => {
    setAction(kind); setMessage(""); setTransaction({ phase: "awaiting-signature", message: `Approve the transaction in your ${network === "celo" ? "Celo" : "Stacks"} wallet.` });
    try {
      const result = kind === "cosign" ? await client.repository.cosign(id, setTransaction) : await client.repository.cancel(id, setTransaction);
      setLastTx(result.hash); setMessage(kind === "cosign" ? "Signal sent. This moment is now mutual." : "Invitation cancelled.");
      await load();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "The transaction could not be completed.";
      setTransaction((current) => ({ ...current, phase: "failed", message }));
    }
    finally { setAction(""); }
  };

  const transactionActive = transaction.phase !== "idle" && transaction.phase !== "confirmed";
  const actionLabel = transaction.phase === "awaiting-signature"
    ? "Approve in wallet…"
    : transaction.phase === "submitted" || transaction.phase === "confirming"
      ? `Confirming on ${network === "celo" ? "Celo" : "Stacks"}…`
      : action === "cancel" ? "Cancelling…" : "Waiting for wallet…";
  const networkLabel = network === "celo" ? "Celo" : "Stacks";
  const creatorLabel = `View creator profile for ${card?.creator ?? ""}`;
  const signerLabel = card?.signer
    ? `View co-signer profile for ${card.signer}`
    : card?.intendedSigner
      ? `Invitation intended for ${card.intendedSigner}`
      : "Open invitation available to any eligible wallet";

  const stateCopy = useMemo(() => {
    if (!card || !status) return null;
    if (status === "completed") return { icon: <Check aria-hidden="true" />, title: "Mutual moment created", text: "Both wallets have confirmed this moment." };
    if (status === "cancelled") return { icon: <Ban aria-hidden="true" />, title: "Invitation cancelled", text: "The original public card remains readable." };
    if (status === "expired") return { icon: <Clock3 aria-hidden="true" />, title: "Invitation expired", text: "This card can no longer receive a co-signature." };
    if (isCreator) return { icon: <Share2 aria-hidden="true" />, title: "Waiting for the other wallet", text: "Share the invitation link or QR code." };
    if (wrongWallet) return { icon: <UserRoundX aria-hidden="true" />, title: "Addressed to another wallet", text: "You can read this card, but only its intended signer can complete it." };
    return { icon: <Share2 aria-hidden="true" />, title: "An invitation for you", text: "Co-sign to confirm this shared moment." };
  }, [card, isCreator, status, wrongWallet]);
  const statusLabel = status ? status[0].toUpperCase() + status.slice(1) : "";

  return (
    <AppShell network={network} account={client.account} connecting={client.connecting} isMiniPay={client.isMiniPay} onConnect={() => void client.connect()} onDisconnect={() => void client.disconnect()}>
      <Link className="back-link" href={`/app/${network}`}><ArrowLeft size={17} aria-hidden="true" /> Back to cards</Link>
      {!client.repository.configured ? <section className="state-panel"><AlertTriangle aria-hidden="true" /><h1>Contract connection pending</h1><p>This route needs its deployed {networkLabel} contract address.</p></section> : loading ? <section className="state-panel"><span className="loader" /><p>Reading the signal…</p></section> : error ? <section className="state-panel"><AlertTriangle aria-hidden="true" /><h1>Could not load this card</h1><p>{error}</p><button type="button" className="button secondary" onClick={() => void load()}><RefreshCw aria-hidden="true" /> Try again</button></section> : !card ? <section className="state-panel"><AlertTriangle aria-hidden="true" /><h1>CoSign not found</h1><p>Check the invitation link and selected network.</p></section> : <section className={`receipt status-${status}`}>
        <div className="receipt-top"><span className="category"><CategoryIcon kind={card.kind} /> {kindLabel(card.kind)}</span><span className="status-stamp">{statusLabel}</span></div>
        <div className="receipt-people">
          <Link href={`/app/${network}/profile/${card.creator}`} aria-label={creatorLabel}><AddressGlyph address={card.creator} size={62} /><span>Creator</span><strong>{shortAddress(card.creator)}</strong></Link>
          <div className="big-connection" aria-hidden="true"><i /><BrandCheck complete={status === "completed"} /></div>
          {card.signer ? <Link href={`/app/${network}/profile/${card.signer}`} aria-label={signerLabel}><AddressGlyph address={card.signer} size={62} /><span>Co-signer</span><strong>{shortAddress(card.signer)}</strong></Link> : <div aria-label={signerLabel}><AddressGlyph address={card.intendedSigner || "open"} size={62} /><span>{card.intendedSigner ? "Invited wallet" : "Open invitation"}</span><strong>{card.intendedSigner ? shortAddress(card.intendedSigner) : "Anyone eligible"}</strong></div>}
        </div>
        <div className="receipt-copy"><span>#{card.id.toString()} · {networkLabel}</span><h1>{card.context}</h1><p>{card.note}</p></div>
        <dl className="receipt-meta"><div><dt>Created</dt><dd>{formatMoment(card.createdAt)}</dd></div><div><dt>Expires</dt><dd>{formatMoment(card.expiresAt)}</dd></div>{card.completedAt ? <div><dt>Completed</dt><dd>{formatMoment(card.completedAt)}</dd></div> : null}</dl>
        {stateCopy ? <div className="receipt-state">{stateCopy.icon}<div><strong>{stateCopy.title}</strong><p>{stateCopy.text}</p></div></div> : null}
        {transactionActive ? <p className={`action-message phase-${transaction.phase}`} role={transaction.phase === "failed" ? "alert" : "status"}>{transaction.message}{transaction.explorerUrl ? <a href={transaction.explorerUrl} target="_blank" rel="noreferrer" aria-label="View transaction in explorer (opens in a new tab)">View transaction <ExternalLink size={14} aria-hidden="true" /></a> : null}</p> : null}
        {message ? <p className="action-message" role="status">{message}{lastTx ? <a href={txExplorerUrl(network, lastTx)} target="_blank" rel="noreferrer" aria-label="View transaction in explorer (opens in a new tab)">View transaction <ExternalLink size={14} aria-hidden="true" /></a> : null}</p> : null}
        <div className="receipt-actions">
          {status === "pending" && !client.connected && !client.isMiniPay ? <button type="button" className="button" onClick={() => void client.connect()} aria-label={`Connect ${networkLabel} wallet to continue with this invitation`}>Connect ${networkLabel} to continue</button> : null}
          {eligible ? <button type="button" className="button" onClick={() => void act("cosign")} disabled={Boolean(action)}>{action === "cosign" ? actionLabel : "Co-sign this moment"}</button> : null}
          {isCreator && status === "pending" ? <><button type="button" className="button" onClick={() => setShare(true)} aria-label="Share this invitation link"><Share2 aria-hidden="true" /> Share invitation</button><button type="button" className="button danger" onClick={() => void act("cancel")} disabled={Boolean(action)}>{action === "cancel" ? actionLabel : "Cancel invitation"}</button></> : null}
          {status === "completed" ? <button type="button" className="button" onClick={() => setShare(true)} aria-label="Share this mutual receipt"><Share2 aria-hidden="true" /> Share receipt</button> : null}
        </div>
      </section>}
      {share ? <ShareSheet url={canonicalHandshakeUrl(publicEnv.appUrl, network, id)} explorerUrl={lastTx ? txExplorerUrl(network, lastTx) : contractExplorerUrl(network)} variant={status === "completed" ? "receipt" : "invitation"} onClose={() => setShare(false)} /> : null}
    </AppShell>
  );
}

function BrandCheck({ complete }: { complete: boolean }) {
  return <span className={complete ? "brand-check complete" : "brand-check"}><Check size={20} aria-hidden="true" /></span>;
}
