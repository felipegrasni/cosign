import type { Handshake, HandshakeKind, HandshakeStatus, Network } from "./types";

export const PAGE_SIZE = 12;
export const CONTEXT_LIMIT = 48;
export const NOTE_LIMIT = 160;
export const ZERO_EVM_ADDRESS = "0x0000000000000000000000000000000000000000";

export const kinds: Array<{ id: HandshakeKind; label: string; verb: string; description: string }> = [
  { id: 0, label: "Met", verb: "met", description: "A conversation worth remembering." },
  { id: 1, label: "Built", verb: "built", description: "Something you made together." },
  { id: 2, label: "Helped", verb: "helped", description: "Support that moved work forward." },
  { id: 3, label: "Learned", verb: "learned", description: "Knowledge shared both ways." },
  { id: 4, label: "Other", verb: "connected", description: "Your own mutual moment." }
];

export const expiryOptions = [
  { label: "24 hours", seconds: 86_400 },
  { label: "7 days", seconds: 604_800 },
  { label: "30 days", seconds: 2_592_000 }
] as const;

export function cleanAscii(value: string, limit: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, limit);
}

export function isPrintableAscii(value: string) {
  return /^[\x20-\x7E]*$/.test(value);
}

export function validateCard(context: string, note: string) {
  const cleanContext = cleanAscii(context, CONTEXT_LIMIT);
  const cleanNote = cleanAscii(note, NOTE_LIMIT);
  const errors: { context?: string; note?: string } = {};
  if (!cleanContext) errors.context = "Add where or what brought you together.";
  else if (!isPrintableAscii(cleanContext)) errors.context = "Use plain ASCII characters only.";
  if (!cleanNote) errors.note = "Add a short note about the moment.";
  else if (!isPrintableAscii(cleanNote)) errors.note = "Use plain ASCII characters only.";
  return { context: cleanContext, note: cleanNote, errors };
}

export function getStatus(handshake: Handshake, now = Math.floor(Date.now() / 1000)): HandshakeStatus {
  if (handshake.cancelled) return "cancelled";
  if (handshake.signer) return "completed";
  if (handshake.expiresAt <= now) return "expired";
  return "pending";
}

export function kindLabel(kind: HandshakeKind) {
  return kinds.find((item) => item.id === kind)?.label || "Other";
}

export function shortAddress(address: string, size = 6) {
  if (!address) return "Not connected";
  if (address.length <= size * 2 + 3) return address;
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}

export function formatMoment(timestamp: number | null) {
  if (!timestamp) return "Pending";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp * 1000));
}

export function formatMomentDateTime(timestamp: number | null) {
  if (!timestamp) return undefined;
  return new Date(timestamp * 1000).toISOString();
}

export function canonicalHandshakeUrl(appUrl: string, network: Network, id: bigint | number | string) {
  return `${appUrl.replace(/\/$/, "")}/app/${network}/handshake/${id}`;
}

export function isNetwork(value: string): value is Network {
  return value === "celo" || value === "stacks";
}
