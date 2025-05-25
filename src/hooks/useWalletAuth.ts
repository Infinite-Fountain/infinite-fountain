"use client";

import { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { httpsCallable } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";
import { auth, functions } from "../firebaseClient";

export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [shouldAuthenticate, setShouldAuthenticate] = useState(false);

  useEffect(() => {
    if (!isConnected || !address || !walletClient || !shouldAuthenticate) return;

    (async () => {
      try {
        // ① Build & sign a nonce
        const nonce = `Login nonce: ${Date.now()}`;
        const signature = await walletClient.signMessage({ message: nonce });

        // ② Call your callable Cloud Function
        const fn = httpsCallable(functions, "createCustomToken");
        const { data } = await fn({ wallet: address, signature, nonce }) as {
          data: { token: string };
        };

        // ③ Sign in with the custom token
        await signInWithCustomToken(auth, data.token);
        console.log("✅ Firebase signed in as:", auth.currentUser?.uid);
        setShouldAuthenticate(false); // Reset the flag after successful authentication
      } catch (err) {
        console.error("❌ Wallet-Auth error:", err);
        setShouldAuthenticate(false); // Reset the flag after error
      }
    })();
  }, [isConnected, address, walletClient, shouldAuthenticate]);

  return { setShouldAuthenticate };
} 