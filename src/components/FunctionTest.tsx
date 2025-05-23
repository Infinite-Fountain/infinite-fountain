"use client";

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseClient";

interface TokenResponse {
  token: string;
}

export default function FunctionTest() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [output, setOutput] = useState<string>("");

  const runTest = async () => {
    if (!isConnected || !address || !walletClient) {
      setOutput("🔒 Connect your wallet first");
      return;
    }

    try {
      setOutput("⏳ Signing nonce…");

      // 1) Generate a nonce
      const nonce = `Test nonce: ${Date.now()}`;

      // 2) Have the wallet sign it
      const signature = await walletClient.signMessage({ message: nonce });

      setOutput("⏳ Calling cloud function…");

      // 3) Call your callable function
      const fn = httpsCallable<{ wallet: string; signature: string; nonce: string }, TokenResponse>(functions, "createCustomToken");
      const { data } = await fn({ wallet: address, signature, nonce });

      // 4) Display the returned JWT
      setOutput(data.token ?? JSON.stringify(data));
    } catch (err: any) {
      setOutput("Error: " + (err.message || err));
    }
  };

  return (
    <div className="p-4 bg-green-800 text-white rounded-md space-y-2">
      <button
        onClick={runTest}
        className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
      >
        Test Wallet → Custom Token
      </button>
      <pre className="whitespace-pre-wrap break-all">{output}</pre>
    </div>
  );
} 