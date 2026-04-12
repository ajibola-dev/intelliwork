import { createClient } from "genlayer-js";

export const CONTRACTS = {
  work:       process.env.NEXT_PUBLIC_WORK_CONTRACT       as `0x${string}`,
  evaluation: process.env.NEXT_PUBLIC_EVALUATION_CONTRACT as `0x${string}`,
  dispute:    process.env.NEXT_PUBLIC_DISPUTE_CONTRACT    as `0x${string}`,
} as const;

export const STUDIONET = {
  id: 61999,
  name: "Genlayer Studio Network",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL ?? "https://studio.genlayer.com/api"] },
  },
} as const;

export function getReadClient() {
  return createClient({ chain: STUDIONET });
}

export function getWriteClient(walletClient: { account: { address: `0x${string}` } }) {
  return createClient({
    chain: STUDIONET,
    // @ts-expect-error — GenLayer accepts viem walletClient as signer
    account: walletClient,
  });
}

/**
 * Build a write client directly from window.ethereum.
 * Use this instead of getWriteClient(walletClient) to avoid
 * wagmi SSR hydration issues with custom chains.
 */
export async function getWindowWriteClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("MetaMask not found");

  const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
  const account = accounts[0];
  if (!account) throw new Error("No accounts found");

  // GenLayer docs: for MetaMask, pass just the address string to createClient()
  return createClient({
    chain: STUDIONET,
    account: account as `0x${string}`,
  });
}
