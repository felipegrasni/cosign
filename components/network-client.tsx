"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createCeloRepository, type InjectedProvider } from "@/lib/repositories/celo";
import { createStacksRepository } from "@/lib/repositories/stacks";
import { getCeloChainId } from "@/lib/env";
import type { HandshakeRepository, Network } from "@/lib/types";

const injectedProvider = () => (window as unknown as { ethereum?: InjectedProvider }).ethereum;

type NetworkClient = {
  account: string;
  connected: boolean;
  connecting: boolean;
  isMiniPay: boolean;
  repository: HandshakeRepository;
  connect(): Promise<string>;
  disconnect(): Promise<void>;
};

async function currentStacksAddress() {
  const { getLocalStorage, isConnected } = await import("@stacks/connect");
  if (!isConnected()) return "";
  const data = getLocalStorage() as { addresses?: { stx?: Array<{ address: string }> } } | null;
  return data?.addresses?.stx?.[0]?.address || "";
}

export function useNetworkClient(network: Network): NetworkClient {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState<InjectedProvider>();
  const [connecting, setConnecting] = useState(false);
  const [isMiniPay, setMiniPay] = useState(false);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      if (network === "celo") {
        const nextProvider = injectedProvider();
        if (!nextProvider) throw new Error("Open CoSign in MiniPay or install a Celo-compatible wallet.");
        const accounts = await nextProvider.request({ method: "eth_requestAccounts" }) as string[];
        const chainId = await nextProvider.request({ method: "eth_chainId" }) as string;
        if (Number.parseInt(chainId, 16) !== getCeloChainId()) {
          try {
            await nextProvider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: `0x${getCeloChainId().toString(16)}` }] });
          } catch {
            await nextProvider.request({ method: "wallet_addEthereumChain", params: [{
              chainId: `0x${getCeloChainId().toString(16)}`,
              chainName: getCeloChainId() === 42220 ? "Celo" : "Celo Sepolia",
              nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
              rpcUrls: [getCeloChainId() === 42220 ? "https://forno.celo.org" : "https://forno.celo-sepolia.celo-testnet.org"],
              blockExplorerUrls: [getCeloChainId() === 42220 ? "https://celoscan.io" : "https://celo-sepolia.blockscout.com"]
            }] });
          }
        }
        setProvider(nextProvider);
        setAccount(accounts[0] || "");
        return accounts[0] || "";
      }
      const { connect: connectStacks } = await import("@stacks/connect");
      await connectStacks();
      const address = await currentStacksAddress();
      setAccount(address);
      return address;
    } finally { setConnecting(false); }
  }, [network]);

  const disconnect = useCallback(async () => {
    if (network === "stacks") {
      const { disconnect: disconnectStacks } = await import("@stacks/connect");
      disconnectStacks();
    }
    setAccount("");
  }, [network]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (network === "celo") {
        const injected = injectedProvider();
        setProvider(injected);
        const mini = Boolean(injected?.isMiniPay);
        setMiniPay(mini);
        if (mini) void connect();
        else if (injected) void injected.request({ method: "eth_accounts" }).then((items: unknown) => setAccount((items as string[])[0] || "")).catch(() => undefined);
      } else {
        void currentStacksAddress().then(setAccount).catch(() => setAccount(""));
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [connect, network]);

  const repository = useMemo(() => network === "celo"
    ? createCeloRepository(provider, account)
    : createStacksRepository(account), [account, network, provider]);

  return { account, connected: Boolean(account), connecting, isMiniPay, repository, connect, disconnect };
}
