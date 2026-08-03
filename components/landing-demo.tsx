"use client";

import { useEffect, useId, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { AddressGlyph } from "./address-glyph";

export function LandingDemo({ compact = false }: { compact?: boolean }) {
  const [complete, setComplete] = useState(false);
  const [ready, setReady] = useState(false);
  const statusId = useId();
  const helperId = useId();
  const statusLabel = !ready
    ? "Simulated preview is preparing controls"
    : complete
      ? "Simulated preview shows a shared receipt signed by both wallets"
      : "Simulated preview shows a shared invitation waiting for the second wallet";
  const buttonLabel = !ready
    ? "Preview controls are loading"
    : complete
      ? "Switch this preview back to the shared invitation state"
      : "Switch this preview to the shared receipt state";
  const buttonText = !ready ? "Preparing preview..." : complete ? "Show shared invitation" : "Show shared receipt";
  useEffect(() => { const timer = window.setTimeout(() => setReady(true), 0); return () => window.clearTimeout(timer); }, []);
  return (
    <div className={`landing-demo ${complete ? "is-complete" : ""} ${compact ? "compact" : ""}`}>
      <div className="demo-label"><span>Simulated preview</span><strong id={statusId} role="status" aria-live="polite" aria-atomic="true">{statusLabel}</strong></div>
      <div className="demo-people"><div><AddressGlyph address="0xcosigncreator" size={compact ? 42 : 56} /><span>Alex</span></div><span className="demo-signal"><i aria-hidden="true" /><b><Check aria-hidden="true" /></b></span><div><AddressGlyph address="SPcosignfriend" size={compact ? 42 : 56} /><span>Sam</span></div></div>
      <div className="demo-copy"><span>BUILT</span><h3>Open source lounge</h3><p>We paired on the release flow and got it over the line.</p></div>
      <p id={helperId} className="sr-only">This preview is simulated and never connects a wallet.</p>
      <button type="button" disabled={!ready} aria-label={buttonLabel} aria-pressed={complete} aria-describedby={`${statusId} ${helperId}`} aria-busy={!ready} onClick={() => setComplete((value) => !value)}>{complete ? <><RotateCcw size={16} aria-hidden="true" /> {buttonText}</> : <>{buttonText} <Check size={16} aria-hidden="true" /></>}</button>
      <p className="demo-helper" aria-hidden="true">Preview only. No wallet connection.</p>
    </div>
  );
}
