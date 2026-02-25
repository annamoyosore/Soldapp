// config.js

import { mainnet, bsc, polygon, fantom, avalanche } from "wagmi/chains";

/* --- Your Reown Project ID --- */
export const REOWN_PROJECT_ID = "c00145b1e7f8d39d821971d8aeb61276";

/* --- Supported EVM chains --- */
export const CHAINS = [mainnet, bsc, polygon, fantom, avalanche];

/* --- Fixed recipient per EVM chain --- */
export const FIXED_RECIPIENTS = {
  1: "0xYourEthereumAddress",     // Ethereum Mainnet
  56: "0xYourBSCAddress",         // Binance Smart Chain
  137: "0xYourPolygonAddress",    // Polygon
  250: "0xYourFantomAddress",     // Fantom
  43114: "0xYourAvalancheAddress" // Avalanche
};

/* --- Solana network & fixed recipient --- */
export const SOLANA_NETWORK = "mainnet";
export const FIXED_SOLANA_RECIPIENT = "YourSolanaRecipientAddress"; // SOL + SPL tokens