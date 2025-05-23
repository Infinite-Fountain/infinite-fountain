"use client";

import { useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { httpsCallable } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";
import { auth, functions } from "../firebaseClient";

export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const { data: walletClient }   = useWalletClient();

  useEffect(() => {
    if (!isConnected || !address || !walletClient) return;

    (async () => {
      try {
        // ① Build & sign a nonce
        const nonce     = `Login nonce: ${Date.now()}`;
        const signature = await walletClient.signMessage({ message: nonce });

        // ② Call your callable Cloud Function
        const fn       = httpsCallable(functions, "createCustomToken");
        const { data } = await fn({ wallet: address, signature, nonce }) as {
          data: { token: string };
        };

        // ③ Sign in with the custom token
        await signInWithCustomToken(auth, data.token);
        console.log("✅ Firebase signed in as:", auth.currentUser?.uid);
      } catch (err) {
        console.error("❌ Wallet-Auth error:", err);
      }
    })();
  }, [isConnected, address, walletClient]);
} 