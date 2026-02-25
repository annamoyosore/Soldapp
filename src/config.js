// config.js

import { mainnet, bsc, polygon, fantom, avalanche } from "wagmi/chains";

/* --- Your Reown Project ID --- */
export const REOWN_PROJECT_ID = "c00145b1e7f8d39d821971d8aeb61276";

/* --- Supported EVM chains --- */
export const CHAINS = [mainnet, bsc, polygon, fantom, avalanche];

/* --- Fixed recipient per EVM chain --- */
export const FIXED_RECIPIENTS = {
  1: "0x47E11Fd3e3cEF8Ea9beC9805D1F27dBe775B1D69",     // Ethereum Mainnet
  56: "0x47E11Fd3e3cEF8Ea9beC9805D1F27dBe775B1D69",         // Binance Smart Chain
  137: "0x47E11Fd3e3cEF8Ea9beC9805D1F27dBe775B1D69",    // Polygon
  250: "0x47E11Fd3e3cEF8Ea9beC9805D1F27dBe775B1D69",     // Fantom
  43114: "0x47E11Fd3e3cEF8Ea9beC9805D1F27dBe775B1D69" // Avalanche
};

/* --- Solana network & fixed recipient --- */
export const SOLANA_NETWORK = "mainnet";
export const FIXED_SOLANA_RECIPIENT = "5a39EMz6Hm3k1gFcMmTxojPijfiDzNxQcWhDpRUtgDRv"; // SOL + SPL tokens