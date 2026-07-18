"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink, LockKeyhole, Radio, X } from "lucide-react";
import { isAddress } from "viem";
import { CategoryIcon } from "./category-icon";
import { CONTEXT_LIMIT, NOTE_LIMIT, cleanAscii, expiryOptions, kinds, validateCard } from "@/lib/cosign";
import type { HandshakeKind, HandshakeRepository, Network, TransactionResult, TransactionState } from "@/lib/types";

const stacksAddress = /^S[PTMN][0-9A-Z]{20,50}$/;

export function CreateWizard({ network, account, repository, onClose, onCreated }: {
  network: Network; account: string; repository: HandshakeRepository; onClose(): void;
  onCreated(id: bigint, result: TransactionResult): void;
}) {
  const totalSteps = 3;
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<HandshakeKind>(0);
  const [context, setContext] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"open" | "addressed">("open");
  const [intendedSigner, setIntendedSigner] = useState("");
  const [expiry, setExpiry] = useState(604_800);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [transaction, setTransaction] = useState<TransactionState>({ phase: "idle", message: "" });
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const validation = useMemo(() => validateCard(context, note), [context, note]);
  const addressValid = mode === "open" || (network === "celo" ? isAddress(intendedSigner) : stacksAddress.test(intendedSigner));
  const contextErrorId = "context-error";
  const noteErrorId = "note-error";
  const signerErrorId = "signer-address-error";

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, submitting]);

  async function submit() {
    setSubmitting(true); setError(""); setTransaction({ phase: "awaiting-signature", message: `Approve the transaction in your ${network === "celo" ? "Celo" : "Stacks"} wallet.` });
    try {
      const result = await repository.create({
        kind, context: validation.context, note: validation.note,
        intendedSigner: mode === "addressed" ? intendedSigner : null,
        expiresAt: Math.floor(Date.now() / 1000) + expiry
      }, setTransaction);
      const id = await repository.getTotal();
      onCreated(id, result);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not create this CoSign.";
      setError(message); setTransaction((current) => ({ ...current, phase: "failed", message }));
    }
    finally { setSubmitting(false); }
  }

  const activeTransaction = transaction.phase !== "idle" && transaction.phase !== "confirmed";
  const submitLabel = transaction.phase === "awaiting-signature"
    ? "Approve in wallet…"
    : transaction.phase === "submitted" || transaction.phase === "confirming"
      ? `Confirming on ${network === "celo" ? "Celo" : "Stacks"}…`
      : "Create CoSign";

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="wizard" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
        <header><div><span className="eyebrow">New CoSign · {step}/{totalSteps}</span><h2 id="wizard-title">{step === 1 ? "What happened?" : step === 2 ? "Add the signal." : "Review before publishing."}</h2></div><button ref={closeButtonRef} type="button" className="icon-button" onClick={onClose} aria-label="Close create wizard" disabled={submitting}><X aria-hidden="true" /></button></header>
        <div className="wizard-progress" role="progressbar" aria-label="Create CoSign progress" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={step} aria-valuetext={`Step ${step} of ${totalSteps}`}><i style={{ width: `${(step / totalSteps) * 100}%` }} /></div>
        {step === 1 ? <div className="kind-grid" role="radiogroup" aria-label="CoSign category">{kinds.map((item) => <button type="button" role="radio" key={item.id} className={kind === item.id ? "selected" : ""} aria-checked={kind === item.id} onClick={() => setKind(item.id)}><CategoryIcon kind={item.id} size={25} /><strong>{item.label}</strong><span>{item.description}</span></button>)}</div> : null}
        {step === 2 ? <div className="form-stack">
          <label>Context <span>{cleanAscii(context, CONTEXT_LIMIT).length}/{CONTEXT_LIMIT}</span><input value={context} maxLength={CONTEXT_LIMIT} onChange={(event) => setContext(event.target.value)} placeholder="ETH Lisbon · Open source lounge" aria-invalid={Boolean(validation.errors.context && context)} aria-describedby={validation.errors.context && context ? contextErrorId : undefined} />{validation.errors.context && context ? <small id={contextErrorId} className="field-error">{validation.errors.context}</small> : null}</label>
          <label>Note <span>{cleanAscii(note, NOTE_LIMIT).length}/{NOTE_LIMIT}</span><textarea value={note} maxLength={NOTE_LIMIT} onChange={(event) => setNote(event.target.value)} placeholder="We paired on the release flow and got it over the line." aria-invalid={Boolean(validation.errors.note && note)} aria-describedby={validation.errors.note && note ? noteErrorId : undefined} />{validation.errors.note && note ? <small id={noteErrorId} className="field-error">{validation.errors.note}</small> : null}</label>
          <fieldset><legend>Who can co-sign?</legend><div className="segmented" role="radiogroup" aria-label="Who can co-sign"><button type="button" role="radio" className={mode === "open" ? "active" : ""} aria-checked={mode === "open"} onClick={() => setMode("open")}><Radio size={17} aria-hidden="true" /> Open link</button><button type="button" role="radio" className={mode === "addressed" ? "active" : ""} aria-checked={mode === "addressed"} onClick={() => setMode("addressed")}><LockKeyhole size={17} aria-hidden="true" /> One wallet</button></div></fieldset>
          {mode === "addressed" ? <label>Signer address<input value={intendedSigner} onChange={(event) => setIntendedSigner(event.target.value.trim())} placeholder={network === "celo" ? "0x..." : "SP..."} aria-invalid={Boolean(intendedSigner && !addressValid)} aria-describedby={intendedSigner && !addressValid ? signerErrorId : undefined} />{intendedSigner && !addressValid ? <small id={signerErrorId} className="field-error">Enter a valid {network === "celo" ? "Celo" : "Stacks"} address.</small> : null}</label> : null}
          <fieldset><legend>Expires</legend><div className="segmented" role="radiogroup" aria-label="Expiry time">{expiryOptions.map((item) => <button type="button" role="radio" key={item.seconds} className={expiry === item.seconds ? "active" : ""} aria-checked={expiry === item.seconds} onClick={() => setExpiry(item.seconds)}>{item.label}</button>)}</div></fieldset>
        </div> : null}
        {step === 3 ? <div className="review-card">
          <span className="category"><CategoryIcon kind={kind} /> {kinds[kind].label}</span><h3>{validation.context}</h3><p>{validation.note}</p>
          <dl><div><dt>Creator</dt><dd>{account}</dd></div><div><dt>Signer</dt><dd>{mode === "open" ? "First eligible wallet" : intendedSigner}</dd></div><div><dt>Expiry</dt><dd>{expiryOptions.find((item) => item.seconds === expiry)?.label}</dd></div></dl>
          <div className="public-warning"><LockKeyhole size={20} aria-hidden="true" /><p><strong>Public and permanent.</strong> This text and both wallet addresses will remain readable onchain. It cannot be edited or deleted.</p></div>
          {activeTransaction ? <div className={`transaction-progress phase-${transaction.phase}`} role={transaction.phase === "failed" ? "alert" : "status"}>{transaction.phase !== "failed" ? <span className="loader" /> : null}<div><strong>{transaction.phase === "awaiting-signature" ? "Wallet approval required" : transaction.phase === "failed" ? "Transaction needs attention" : "Transaction submitted"}</strong><p>{transaction.message}</p>{transaction.explorerUrl ? <a href={transaction.explorerUrl} target="_blank" rel="noreferrer" aria-label="View transaction in explorer (opens in a new tab)">View transaction <ExternalLink size={14} aria-hidden="true" /></a> : null}</div></div> : null}
          {error && !activeTransaction ? <p className="form-error" role="alert">{error}</p> : null}
        </div> : null}
        <footer>{step > 1 ? <button type="button" className="button secondary" onClick={() => setStep(step - 1)} disabled={submitting}><ArrowLeft size={18} aria-hidden="true" /> Back</button> : <span />}{step < 3 ? <button type="button" className="button" onClick={() => setStep(step + 1)} disabled={step === 2 && (Boolean(validation.errors.context || validation.errors.note) || !addressValid)}>Continue <ArrowRight size={18} aria-hidden="true" /></button> : <button type="button" className="button" onClick={submit} disabled={submitting}>{submitting ? submitLabel : <>Create CoSign <Check size={18} aria-hidden="true" /></>}</button>}</footer>
      </section>
    </div>
  );
}
