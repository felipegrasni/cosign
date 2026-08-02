"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type ShareSheetVariant = "invitation" | "receipt";

export function ShareSheet({
  url,
  explorerUrl,
  onClose,
  variant = "invitation",
  dialogId
}: {
  url: string;
  explorerUrl?: string;
  onClose(): void;
  variant?: ShareSheetVariant;
  dialogId?: string;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const linkTextRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const hintId = useId();
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const canCopyToClipboard = typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function";
  const copyButtonText = copyState === "copied"
    ? variant === "receipt" ? "Receipt link copied" : "Invitation link copied"
    : copyState === "manual"
      ? "Select link manually"
      : variant === "receipt" ? "Copy receipt link" : "Copy invitation link";
  const copyButtonLabel = copyState === "copied"
    ? variant === "receipt" ? "Receipt link copied" : "Invitation link copied"
    : copyState === "manual"
      ? variant === "receipt" ? "Select the receipt link text manually" : "Select the invitation link text manually"
      : variant === "receipt" ? "Copy receipt link" : "Copy invitation link";
  const statusMessage = copyState === "copied"
    ? variant === "receipt" ? "Receipt link copied to clipboard." : "Invitation link copied to clipboard."
    : copyState === "manual"
      ? "Clipboard copy is unavailable here. Select the link text manually."
      : "";
  const title = variant === "receipt" ? "Share the receipt." : "Share the invitation.";
  const description = variant === "receipt"
    ? "Let someone scan this code or open the link to view the shared receipt."
    : "Let the other wallet scan this code or open the invitation link on the same network.";
  const qrHint = variant === "receipt"
    ? canCopyToClipboard ? "Scan with another device or copy the receipt link below." : "Scan with another device or select the receipt link below."
    : canCopyToClipboard ? "Scan with another device or copy the invitation link below." : "Scan with another device or select the invitation link below.";
  const shareLabel = variant === "receipt" ? "Share receipt" : "Share invitation";
  const closeLabel = variant === "receipt" ? "Close share receipt dialog" : "Close share invitation dialog";
  const explorerLabel = variant === "receipt" ? "View receipt on explorer" : "View invitation on explorer";
  const explorerAriaLabel = variant === "receipt"
    ? "View this receipt on the blockchain explorer (opens in a new tab)"
    : "View this invitation on the blockchain explorer (opens in a new tab)";
  const selectLinkText = () => {
    if (!linkTextRef.current) return;

    linkTextRef.current.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(linkTextRef.current);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };
  const copy = async () => {
    if (!canCopyToClipboard) {
      setCopyState("manual");
      selectLinkText();
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("manual");
      selectLinkText();
    }
  };
  const share = async () => {
    if (!canNativeShare) {
      await copy();
      return;
    }

    try {
      await navigator.share({
        title: variant === "receipt" ? "CoSign receipt" : "CoSign invitation",
        text: variant === "receipt" ? "View this shared CoSign receipt." : "Open this CoSign invitation on the same network and add the second wallet signature.",
        url
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await copy();
    }
  };

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
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
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
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
      <section id={dialogId} ref={sheetRef} className="share-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={`${descriptionId} ${hintId}`}>
        <button ref={closeButtonRef} type="button" className="icon-button close" onClick={onClose} aria-label={closeLabel}><X aria-hidden="true" /></button>
        <span className="eyebrow">{variant === "receipt" ? "Receipt ready" : "Invitation ready"}</span>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>
        <div className="qr-wrap"><QRCodeSVG value={url} size={210} bgColor="#fffaf2" fgColor="#17151f" level="M" aria-hidden="true" focusable="false" /></div>
        <p id={hintId} className="share-hint">{qrHint}</p>
        <div className="copy-row">
          <code
            ref={linkTextRef}
            className="share-link-text"
            tabIndex={0}
            aria-label={variant === "receipt" ? "Receipt link" : "Invitation link"}
            title={url}
            onFocus={selectLinkText}
            onClick={selectLinkText}
          >
            {url}
          </code>
          <button type="button" onClick={copyState === "manual" ? selectLinkText : copy} aria-label={copyButtonLabel}>
            {copyState === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            <span>{copyButtonText}</span>
          </button>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{statusMessage}</p>
        <div className="share-actions">{canNativeShare ? <button type="button" className="button" onClick={share}><Share2 size={18} aria-hidden="true" /> {shareLabel}</button> : null}{explorerUrl ? <a className="button secondary" href={explorerUrl} target="_blank" rel="noreferrer" aria-label={explorerAriaLabel}>{explorerLabel} <ExternalLink size={17} aria-hidden="true" /></a> : null}</div>
      </section>
    </div>
  );
}
