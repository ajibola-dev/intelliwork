import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

export const genLayerStudionet = {
  id: 61999,
  name: "GenLayer Studionet",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://studio.genlayer.com/api"] },
  },
  blockExplorers: {
    default: { name: "GenLayer Studio", url: "https://studio.genlayer.com" },
  },
  testnet: true,
} as const;

export const wagmiConfig = createConfig({
  chains: [genLayerStudionet],
  connectors: [injected()],
  transports: {
    [genLayerStudionet.id]: http("https://studio.genlayer.com/api"),
  },
  ssr: true,
});
