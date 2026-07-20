"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { AddressGlyph } from "./address-glyph";

export function LandingDemo({ compact = false }: { compact?: boolean }) {
  const [complete, setComplete] = useState(false);
  const [ready, setReady] = useState(false);
  const statusId = compact ? "landing-demo-status-compact" : "landing-demo-status";
  const statusLabel = complete ? "Preview shows a mutual moment" : "Preview shows a waiting invitation";
  const buttonLabel = complete ? "Switch this preview back to the waiting invitation state" : "Switch this preview to the co-signed receipt state";
  const buttonText = complete ? "Show waiting preview" : "Preview co-signed state";
  useEffect(() => { const timer = window.setTimeout(() => setReady(true), 0); return () => window.clearTimeout(timer); }, []);
  return (
    <div className={`landing-demo ${complete ? "is-complete" : ""} ${compact ? "compact" : ""}`}>
      <div className="demo-label"><span>Interactive preview</span><strong id={statusId} role="status" aria-live="polite" aria-atomic="true">{statusLabel}</strong></div>
      <div className="demo-people"><div><AddressGlyph address="0xcosigncreator" size={compact ? 42 : 56} /><span>Alex</span></div><span className="demo-signal"><i aria-hidden="true" /><b><Check aria-hidden="true" /></b></span><div><AddressGlyph address="SPcosignfriend" size={compact ? 42 : 56} /><span>Sam</span></div></div>
      <div className="demo-copy"><span>BUILT</span><h3>Open source lounge</h3><p>We paired on the release flow and got it over the line.</p></div>
      <button type="button" disabled={!ready} aria-label={buttonLabel} aria-pressed={complete} aria-describedby={statusId} onClick={() => setComplete((value) => !value)}>{complete ? <><RotateCcw size={16} aria-hidden="true" /> {buttonText}</> : <>{buttonText} <Check size={16} aria-hidden="true" /></>}</button>
    </div>
  );
}
