import { getStacksApi, publicEnv, txExplorerUrl } from "../env";
import type { Handshake, HandshakeRepository, TransactionObserver, TransactionResult } from "../types";

type ClarityJson = { type?: string; value?: unknown };

const contract = () => ({ address: publicEnv.stacksContractAddress, name: publicEnv.stacksContractName });

function unwrap(value: unknown): unknown {
  const json = value as ClarityJson;
  const type = json?.type?.toLowerCase() || "";
  if ((type.includes("response") || type.includes("optional") || type === "ok" || type === "some") && !type.includes("err") && "value" in json) return unwrap(json.value);
  return value;
}

function scalar(value: unknown): unknown {
  const current = unwrap(value) as ClarityJson;
  return current && typeof current === "object" && "value" in current ? scalar(current.value) : current;
}

function asBigInt(value: unknown) { return BigInt(String(scalar(value) ?? 0)); }
function asString(value: unknown) { const item = scalar(value); return typeof item === "string" ? item : ""; }
function asBool(value: unknown) { const item = scalar(value); return item === true || item === "true"; }

function asOptionalPrincipal(value: unknown): string | null {
  const json = value as ClarityJson;
  if (json?.type?.toLowerCase().includes("none") || json?.value === null) return null;
  const result = asString(value);
  return result || null;
}

function tupleOf(value: unknown): Record<string, unknown> | null {
  const unwrapped = unwrap(value) as { value?: unknown; data?: unknown };
  const candidate = unwrapped?.value ?? unwrapped?.data ?? unwrapped;
  if (!candidate || typeof candidate !== "object") return null;
  return candidate as Record<string, unknown>;
}

async function readOnly(functionName: string, args: unknown[], sender: string) {
  const { fetchCallReadOnlyFunction, cvToJSON } = await import("@stacks/transactions");
  const response = await fetchCallReadOnlyFunction({
    contractAddress: contract().address,
    contractName: contract().name,
    functionName,
    functionArgs: args as never,
    senderAddress: sender || contract().address || "ST000000000000000000002AMW42H",
    network: publicEnv.stacksNetwork
  });
  return cvToJSON(response);
}

function mapHandshake(value: unknown, id: bigint): Handshake | null {
  const item = tupleOf(value);
  if (!item) return null;
  return {
    id, network: "stacks", creator: asString(item.creator), signer: asOptionalPrincipal(item.signer),
    intendedSigner: asOptionalPrincipal(item["intended-signer"]), kind: Number(asBigInt(item.kind)) as Handshake["kind"],
    context: asString(item.context), note: asString(item.note), createdAt: Number(asBigInt(item["created-at"])),
    expiresAt: Number(asBigInt(item["expires-at"])), completedAt: asBigInt(item["completed-at"]) === 0n ? null : Number(asBigInt(item["completed-at"])),
    cancelled: asBool(item.cancelled)
  };
}

export function createStacksRepository(account = ""): HandshakeRepository {
  const waitForConfirmation = async (hash: string) => {
    for (let attempt = 0; attempt < 90; attempt++) {
      const response = await fetch(`${getStacksApi()}/extended/v1/tx/${hash}`);
      if (response.ok) {
        const result = await response.json() as { tx_status?: string };
        if (result.tx_status === "success") return;
        if (result.tx_status?.startsWith("abort") || result.tx_status?.startsWith("dropped")) throw new Error(`Stacks transaction ended with ${result.tx_status}.`);
      }
      await new Promise((resolve) => window.setTimeout(resolve, 2_000));
    }
    throw new Error("The Stacks transaction is still pending. Refresh the card after it confirms.");
  };
  const call = async (functionName: string, functionArgs: unknown[], onTransaction?: TransactionObserver): Promise<TransactionResult> => {
    if (!account) throw new Error("Connect a Stacks wallet first.");
    const { request } = await import("@stacks/connect");
    onTransaction?.({ phase: "awaiting-signature", message: "Approve the transaction in your Stacks wallet." });
    try {
      const response = await request("stx_callContract", {
        contract: `${contract().address}.${contract().name}` as `${string}.${string}`,
        functionName,
        functionArgs: functionArgs as never,
        network: publicEnv.stacksNetwork
      });
      const hash = response.txid || "";
      if (!hash) throw new Error("The wallet did not return a transaction ID. Check your wallet activity before trying again.");
      const explorerUrl = txExplorerUrl("stacks", hash);
      onTransaction?.({ phase: "confirming", message: "Transaction submitted. Waiting for Stacks confirmation.", hash, explorerUrl });
      await waitForConfirmation(hash);
      onTransaction?.({ phase: "confirmed", message: "Transaction confirmed on Stacks.", hash, explorerUrl });
      return { hash, explorerUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("u407")) throw new Error("You cannot co-sign your own card.");
      if (message.includes("u408")) throw new Error("This card is addressed to another wallet.");
      if (message.includes("u409")) throw new Error("This card has already been completed.");
      if (message.includes("u410")) throw new Error("This card has been cancelled.");
      if (message.includes("u411")) throw new Error("This card has expired.");
      throw error;
    }
  };

  return {
    network: "stacks", configured: Boolean(contract().address && contract().name),
    async getTotal() { return asBigInt(await readOnly("get-total", [], account || contract().address)); },
    async getHandshake(id) { const { Cl } = await import("@stacks/transactions"); try { return mapHandshake(await readOnly("get-handshake", [Cl.uint(id)], account || contract().address), id); } catch { return null; } },
    async getCreatedCount(owner) { const { Cl } = await import("@stacks/transactions"); return asBigInt(await readOnly("get-created-count", [Cl.principal(owner)], owner)); },
    async getSignedCount(owner) { const { Cl } = await import("@stacks/transactions"); return asBigInt(await readOnly("get-signed-count", [Cl.principal(owner)], owner)); },
    async getCreatedIds(owner, start, count) { const { Cl } = await import("@stacks/transactions"); return Promise.all(Array.from({ length: count }, (_, i) => readOnly("get-created-id", [Cl.principal(owner), Cl.uint(start + BigInt(i))], owner).then(asBigInt))); },
    async getSignedIds(owner, start, count) { const { Cl } = await import("@stacks/transactions"); return Promise.all(Array.from({ length: count }, (_, i) => readOnly("get-signed-id", [Cl.principal(owner), Cl.uint(start + BigInt(i))], owner).then(asBigInt))); },
    async create(input, onTransaction) {
      const { Cl } = await import("@stacks/transactions");
      return call("create-handshake", [Cl.uint(input.kind), Cl.stringAscii(input.context), Cl.stringAscii(input.note), input.intendedSigner ? Cl.some(Cl.principal(input.intendedSigner)) : Cl.none(), Cl.uint(input.expiresAt)], onTransaction);
    },
    async cosign(id, onTransaction) { const { Cl } = await import("@stacks/transactions"); return call("cosign", [Cl.uint(id)], onTransaction); },
    async cancel(id, onTransaction) { const { Cl } = await import("@stacks/transactions"); return call("cancel-handshake", [Cl.uint(id)], onTransaction); }
  };
}

export const stacksParsing = { unwrap, asBigInt, asString, asBool, asOptionalPrincipal, tupleOf, mapHandshake };
