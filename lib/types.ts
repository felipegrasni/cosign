export type Network = "celo" | "stacks";
export type HandshakeKind = 0 | 1 | 2 | 3 | 4;
export type HandshakeStatus = "pending" | "completed" | "cancelled" | "expired";

export type Handshake = {
  id: bigint;
  network: Network;
  creator: string;
  signer: string | null;
  intendedSigner: string | null;
  kind: HandshakeKind;
  context: string;
  note: string;
  createdAt: number;
  expiresAt: number;
  completedAt: number | null;
  cancelled: boolean;
};

export type CreateHandshakeInput = {
  kind: HandshakeKind;
  context: string;
  note: string;
  intendedSigner: string | null;
  expiresAt: number;
};

export type TransactionPhase =
  | "idle"
  | "connecting"
  | "awaiting-signature"
  | "submitted"
  | "confirming"
  | "confirmed"
  | "failed";

export type TransactionResult = { hash: string; explorerUrl: string };

export type TransactionState = {
  phase: TransactionPhase;
  message: string;
  hash?: string;
  explorerUrl?: string;
};

export interface HandshakeRepository {
  readonly network: Network;
  readonly configured: boolean;
  getTotal(): Promise<bigint>;
  getHandshake(id: bigint): Promise<Handshake | null>;
  getCreatedCount(address: string): Promise<bigint>;
  getSignedCount(address: string): Promise<bigint>;
  getCreatedIds(address: string, start: bigint, count: number): Promise<bigint[]>;
  getSignedIds(address: string, start: bigint, count: number): Promise<bigint[]>;
  create(input: CreateHandshakeInput): Promise<TransactionResult>;
  cosign(id: bigint): Promise<TransactionResult>;
  cancel(id: bigint): Promise<TransactionResult>;
}
