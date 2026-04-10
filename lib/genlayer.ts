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
  const win = window as unknown as { ethereum?: { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> } };
  if (typeof window === "undefined" || !win.ethereum) {
    throw new Error("MetaMask not found");
  }
  const accounts = await win.ethereum.request({ method: "eth_requestAccounts" }) as string[];
  const account = Array.isArray(accounts) ? accounts[0] : (accounts as unknown as string);
  if (!account) throw new Error("No accounts found");
  
  const { createWalletClient, custom, toHex } = await import("viem");
  const viemWalletClient = createWalletClient({
    account: account as `0x${string}`,
    transport: custom(win.ethereum as Parameters<typeof custom>[0]),
  });

  return createClient({
    chain: STUDIONET,
    // @ts-expect-error — GenLayer accepts viem walletClient as signer
    account: viemWalletClient,
  });
}
