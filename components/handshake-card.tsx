import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { AddressGlyph } from "./address-glyph";
import { CategoryIcon } from "./category-icon";
import { formatMoment, getStatus, kindLabel, shortAddress } from "@/lib/cosign";
import type { Handshake } from "@/lib/types";

export function HandshakeCard({ handshake, linked = true }: { handshake: Handshake; linked?: boolean }) {
  const status = getStatus(handshake);
  const statusLabel = status[0].toUpperCase() + status.slice(1);
  const creatorLabel = `Creator wallet ${handshake.creator}`;
  const signerText = handshake.signer ? shortAddress(handshake.signer, 4) : handshake.intendedSigner ? "Invited" : "Open";
  const signerLabel = handshake.signer
    ? `Co-signer wallet ${handshake.signer}`
    : handshake.intendedSigner
      ? `Invited wallet ${handshake.intendedSigner}`
      : "Open invitation";
  const linkLabel = `Open ${kindLabel(handshake.kind)} card, ${status}, from ${creatorLabel.toLowerCase()} to ${signerLabel.toLowerCase()}`;
  const content = (
    <article className={`handshake-card status-${status}`}>
      <header>
        <span className="category"><CategoryIcon kind={handshake.kind} /> {kindLabel(handshake.kind)}</span>
        <span className="status-stamp">{statusLabel}</span>
      </header>
      <div className="card-people">
        <div><AddressGlyph address={handshake.creator} size={38} /><span aria-label={creatorLabel} title={handshake.creator}>{shortAddress(handshake.creator, 4)}</span></div>
        <span className="connection-line" aria-hidden="true"><i /></span>
        <div><AddressGlyph address={handshake.signer || handshake.intendedSigner || "open"} size={38} /><span aria-label={signerLabel} title={handshake.signer || handshake.intendedSigner || undefined}>{signerText}</span></div>
      </div>
      <h3>{handshake.context}</h3>
      <p>{handshake.note}</p>
      <footer><span><Clock3 size={15} aria-hidden="true" /> {formatMoment(handshake.createdAt)}</span>{linked ? <ArrowUpRight size={18} aria-hidden="true" /> : null}</footer>
    </article>
  );
  return linked ? <Link className="card-link" href={`/app/${handshake.network}/handshake/${handshake.id}`} aria-label={linkLabel}>{content}</Link> : content;
}
