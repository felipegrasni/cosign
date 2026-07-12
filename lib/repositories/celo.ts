import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  http,
  type Address,
  type EIP1193Provider
} from "viem";
import { coSignCeloAbi } from "../celo-abi";
import { ZERO_EVM_ADDRESS } from "../cosign";
import { getCeloChainId, getCeloExplorer, getCeloRpc, publicEnv } from "../env";
import type { CreateHandshakeInput, Handshake, HandshakeRepository, TransactionResult } from "../types";

export type InjectedProvider = EIP1193Provider & { isMiniPay?: boolean };

const chain = defineChain({
  id: getCeloChainId(),
  name: publicEnv.celoNetwork === "celo" ? "Celo" : "Celo Sepolia",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: { default: { http: [getCeloRpc()] } },
  blockExplorers: { default: { name: "Celo Explorer", url: getCeloExplorer() } }
});

const publicClient = createPublicClient({ chain, transport: http(getCeloRpc()) });

function mapHandshake(raw: readonly unknown[]): Handshake {
  const item = raw as readonly [bigint, Address, Address, Address, number, string, string, bigint, bigint, bigint, boolean];
  return {
    id: item[0], network: "celo", creator: item[1], signer: item[2] === ZERO_EVM_ADDRESS ? null : item[2],
    intendedSigner: item[3] === ZERO_EVM_ADDRESS ? null : item[3], kind: item[4] as Handshake["kind"],
    context: item[5], note: item[6], createdAt: Number(item[7]), expiresAt: Number(item[8]),
    completedAt: item[9] === 0n ? null : Number(item[9]), cancelled: item[10]
  };
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const names = ["InvalidKind", "InvalidContext", "InvalidNote", "InvalidExpiry", "SelfTarget", "NotFound", "NotCreator", "SelfSign", "WrongSigner", "AlreadyCompleted", "AlreadyCancelled", "Expired"];
  const match = names.find((name) => message.includes(name));
  if (!match) return new Error("The Celo transaction could not be completed. Check your wallet and try again.");
  const map: Record<string, string> = {
    InvalidKind: "Choose a valid card category.", InvalidContext: "Check the context text.", InvalidNote: "Check the note text.",
    InvalidExpiry: "Choose an expiry between one hour and thirty days.", SelfTarget: "You cannot address a card to yourself.",
    NotFound: "This CoSign does not exist.", NotCreator: "Only the creator can cancel this card.", SelfSign: "You cannot co-sign your own card.",
    WrongSigner: "This card is addressed to another wallet.", AlreadyCompleted: "This card has already been completed.",
    AlreadyCancelled: "This card has been cancelled.", Expired: "This card has expired."
  };
  return new Error(map[match]);
}

export function createCeloRepository(provider?: InjectedProvider, account?: string): HandshakeRepository {
  const address = publicEnv.celoContractAddress as Address;
  const wallet = provider ? createWalletClient({ account: account as Address | undefined, chain, transport: custom(provider) }) : null;
  const read = async <T>(functionName: string, args: readonly unknown[] = []) => publicClient.readContract({
    address, abi: coSignCeloAbi, functionName: functionName as never, args: args as never
  }) as Promise<T>;
  const write = async (functionName: string, args: readonly unknown[]): Promise<TransactionResult> => {
    if (!wallet || !account) throw new Error("Connect a Celo wallet first.");
    try {
      const hash = await wallet.writeContract({ address, abi: coSignCeloAbi, functionName: functionName as never, args: args as never, account: account as Address, chain });
      await publicClient.waitForTransactionReceipt({ hash });
      return { hash, explorerUrl: `${getCeloExplorer()}/tx/${hash}` };
    } catch (error) { throw friendlyError(error); }
  };

  return {
    network: "celo", configured: Boolean(address),
    getTotal: () => read<bigint>("totalHandshakes"),
    async getHandshake(id) {
      try { return mapHandshake(await read<readonly unknown[]>("getHandshake", [id])); }
      catch (error) { if (String(error).includes("NotFound")) return null; throw error; }
    },
    getCreatedCount: (owner) => read<bigint>("getCreatedCount", [owner as Address]),
    getSignedCount: (owner) => read<bigint>("getSignedCount", [owner as Address]),
    async getCreatedIds(owner, start, count) { return Promise.all(Array.from({ length: count }, (_, i) => read<bigint>("getCreatedId", [owner as Address, start + BigInt(i)]))); },
    async getSignedIds(owner, start, count) { return Promise.all(Array.from({ length: count }, (_, i) => read<bigint>("getSignedId", [owner as Address, start + BigInt(i)]))); },
    create: (input: CreateHandshakeInput) => write("createHandshake", [input.kind, input.context, input.note, (input.intendedSigner || ZERO_EVM_ADDRESS) as Address, BigInt(input.expiresAt)]),
    cosign: (id) => write("cosign", [id]),
    cancel: (id) => write("cancelHandshake", [id])
  };
}

export { chain as celoChain };
