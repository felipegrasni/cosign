"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function ShareSheet({ url, explorerUrl, onClose }: { url: string; explorerUrl?: string; onClose(): void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const share = async () => {
    if (navigator.share) await navigator.share({ title: "CoSign invitation", text: "Make this moment mutual.", url });
    else await copy();
  };
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="share-sheet" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <button className="icon-button close" onClick={onClose} aria-label="Close"><X /></button>
        <span className="eyebrow">Invitation ready</span>
        <h2 id="share-title">Pass the signal.</h2>
        <p>Let the other person scan this code or send them the link.</p>
        <div className="qr-wrap"><QRCodeSVG value={url} size={210} bgColor="#fffaf2" fgColor="#17151f" level="M" /></div>
        <div className="copy-row"><code>{url}</code><button onClick={copy} aria-label="Copy invitation link">{copied ? <Check /> : <Copy />}</button></div>
        <div className="share-actions"><button className="button" onClick={share}><Share2 size={18} /> Share invitation</button>{explorerUrl ? <a className="button secondary" href={explorerUrl} target="_blank" rel="noreferrer">Explorer <ExternalLink size={17} /></a> : null}</div>
      </section>
    </div>
  );
}
