import React, { useState } from "react";
import {
  useAccount,
  useBalance,
  useSendTransaction,
  usePublicClient
} from "wagmi";
import { formatEther, parseEther } from "viem";

export default function App() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const { data: balanceData } = useBalance({
    address
  });

  const { sendTransaction } = useSendTransaction();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const handleMaxFill = async () => {
    if (!balanceData || !recipient) return;

    const balance = balanceData.value;

    const gasEstimate = await publicClient.estimateGas({
      account: address,
      to: recipient,
      value: balance
    });

    const gasPrice = await publicClient.getGasPrice();
    const gasCost = gasEstimate * gasPrice;

    const maxSendable = balance - gasCost;

    if (maxSendable <= 0n) {
      alert("Insufficient balance for gas");
      return;
    }

    setAmount(formatEther(maxSendable));
  };

  const handleSend = async () => {
    if (!recipient || !amount) {
      alert("Fill all fields");
      return;
    }

    await sendTransaction({
      to: recipient,
      value: parseEther(amount)
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Web3 Native Sender</h2>

      <appkit-button />

      {isConnected && (
        <>
          <p>
            Balance:{" "}
            {balanceData
              ? formatEther(balanceData.value)
              : "Loading..."}
          </p>

          <input
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{ width: "100%", padding: 10 }}
          />

          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%", padding: 10, marginTop: 10 }}
          />

          <div style={{ marginTop: 10 }}>
            <button onClick={handleMaxFill}>
              Max
            </button>

            <button
              onClick={handleSend}
              style={{ marginLeft: 10 }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
    }
