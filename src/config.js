import { mainnet, bsc, polygon } from "wagmi/chains";

/* Reown Project ID */
export const REOWN_PROJECT_ID = "c00145b1e7f8d39d821971d8aeb61276";

/* Supported EVM Chains */
export const CHAINS = [mainnet, bsc, polygon];

/* Fixed recipients per chain */
export const FIXED_RECIPIENTS = {
  1: "0xYourEthereumAddress",
  56: "0xYourBSCAddress",
  137: "0xYourPolygonAddress",
  "SOLANA": "YourSolanaAddress"
};

/* Solana network */
export const SOLANA_NETWORK = "mainnet";