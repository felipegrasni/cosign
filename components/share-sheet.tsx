"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type ShareSheetVariant = "invitation" | "receipt";

export function ShareSheet({
  url,
  explorerUrl,
  onClose,
  variant = "invitation"
}: {
  url: string;
  explorerUrl?: string;
  onClose(): void;
  variant?: ShareSheetVariant;
}) {
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const copyLabel = variant === "receipt" ? "Copy receipt link" : "Copy invitation link";
  const copyButtonText = copied ? "Copied" : "Copy link";
  const statusMessage = variant === "receipt" ? "Receipt link copied to clipboard." : "Invitation link copied to clipboard.";
  const title = variant === "receipt" ? "Share the receipt." : "Pass the signal.";
  const descriptionId = "share-description";
  const hintId = "share-hint";
  const description = variant === "receipt"
    ? "Let someone scan this code or open the link to view the shared receipt."
    : "Let the other person scan this code or send them the link.";
  const qrHint = variant === "receipt"
    ? "Scan with another device or copy the receipt link below."
    : "Scan with another device or copy the invitation link below.";
  const shareLabel = variant === "receipt" ? "Share receipt" : "Share invitation";
  const closeLabel = variant === "receipt" ? "Close share receipt dialog" : "Close share invitation dialog";
  const copy = async () => { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const share = async () => {
    if (navigator.share) await navigator.share({
      title: variant === "receipt" ? "CoSign receipt" : "CoSign invitation",
      text: variant === "receipt" ? "View this shared CoSign receipt." : "Make this moment mutual.",
      url
    });
    else await copy();
  };

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="share-sheet" role="dialog" aria-modal="true" aria-labelledby="share-title" aria-describedby={`${descriptionId} ${hintId}`}>
        <button ref={closeButtonRef} type="button" className="icon-button close" onClick={onClose} aria-label={closeLabel}><X aria-hidden="true" /></button>
        <span className="eyebrow">{variant === "receipt" ? "Receipt ready" : "Invitation ready"}</span>
        <h2 id="share-title">{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="qr-wrap"><QRCodeSVG value={url} size={210} bgColor="#fffaf2" fgColor="#17151f" level="M" aria-hidden="true" focusable="false" /></div>
        <p id={hintId} className="share-hint">{qrHint}</p>
        <div className="copy-row">
          <code>{url}</code>
          <button type="button" onClick={copy} aria-label={copyLabel}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            <span>{copyButtonText}</span>
          </button>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{copied ? statusMessage : ""}</p>
        <div className="share-actions"><button type="button" className="button" onClick={share}><Share2 size={18} aria-hidden="true" /> {shareLabel}</button>{explorerUrl ? <a className="button secondary" href={explorerUrl} target="_blank" rel="noreferrer" aria-label="Open in explorer (opens in a new tab)">Explorer <ExternalLink size={17} aria-hidden="true" /></a> : null}</div>
      </section>
    </div>
  );
}
