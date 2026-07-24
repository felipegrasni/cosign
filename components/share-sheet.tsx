"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const sheetRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const hintId = useId();
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const copyLabel = variant === "receipt" ? "Copy receipt link" : "Copy invitation link";
  const copyButtonText = copied
    ? variant === "receipt" ? "Receipt copied" : "Invitation copied"
    : variant === "receipt" ? "Copy receipt" : "Copy invitation";
  const statusMessage = variant === "receipt" ? "Receipt link copied to clipboard." : "Invitation link copied to clipboard.";
  const title = variant === "receipt" ? "Share the receipt." : "Share the invitation.";
  const description = variant === "receipt"
    ? "Let someone scan this code or open the link to view the shared receipt."
    : "Let the other wallet scan this code or open the invitation link.";
  const qrHint = variant === "receipt"
    ? "Scan with another device or copy the receipt link below."
    : "Scan with another device or copy the invitation link below.";
  const shareLabel = variant === "receipt" ? "Share receipt" : "Share invitation";
  const closeLabel = variant === "receipt" ? "Close share receipt dialog" : "Close share invitation dialog";
  const explorerLabel = variant === "receipt" ? "View receipt on explorer" : "View invitation on explorer";
  const explorerAriaLabel = variant === "receipt"
    ? "View this receipt on the blockchain explorer (opens in a new tab)"
    : "View this invitation on the blockchain explorer (opens in a new tab)";
  const copy = async () => { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const share = async () => {
    if (canNativeShare) await navigator.share({
      title: variant === "receipt" ? "CoSign receipt" : "CoSign invitation",
      text: variant === "receipt" ? "View this shared CoSign receipt." : "Open this CoSign invitation and add the second wallet signature.",
      url
    });
    else await copy();
  };

  useEffect(() => {
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

      const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="modal-backdrop" role="presentation" onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={sheetRef} className="share-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={`${descriptionId} ${hintId}`}>
        <button ref={closeButtonRef} type="button" className="icon-button close" onClick={onClose} aria-label={closeLabel}><X aria-hidden="true" /></button>
        <span className="eyebrow">{variant === "receipt" ? "Receipt ready" : "Invitation ready"}</span>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="qr-wrap"><QRCodeSVG value={url} size={210} bgColor="#fffaf2" fgColor="#17151f" level="M" aria-hidden="true" focusable="false" /></div>
        <p id={hintId} className="share-hint">{qrHint}</p>
        <div className="copy-row">
          <code aria-label={variant === "receipt" ? "Receipt link" : "Invitation link"} title={url}>{url}</code>
          <button type="button" onClick={copy} aria-label={copyLabel}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            <span>{copyButtonText}</span>
          </button>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{copied ? statusMessage : ""}</p>
        <div className="share-actions">{canNativeShare ? <button type="button" className="button" onClick={share}><Share2 size={18} aria-hidden="true" /> {shareLabel}</button> : null}{explorerUrl ? <a className="button secondary" href={explorerUrl} target="_blank" rel="noreferrer" aria-label={explorerAriaLabel}>{explorerLabel} <ExternalLink size={17} aria-hidden="true" /></a> : null}</div>
      </section>
    </div>
  );
}
