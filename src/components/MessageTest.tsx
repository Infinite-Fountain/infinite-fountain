"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseClient";

export default function MessageTest() {
  const { address } = useAccount();
  const [status, setStatus] = useState<string>("");

  const write = async () => {
    if (!address) {
      setStatus("Connect wallet first");
      return;
    }
    setStatus("Writing…");
    try {
      const uid = auth.currentUser!.uid;
      const ref = doc(
        db,
        // ← root collection is now "ideation"
        "ideation",
        // ← this is your experiment ID
        "allo-flow-greenpill-money-council",
        // ← slide/index subcollection
        "indexes",
        "13",
        // ← user‐specific messages
        "messages",
        uid
      );

      console.log("→ About to write to:", ref.path);
      console.log("→ auth.currentUser.uid is:", uid);

      await setDoc(ref, {
        original: "Hello Firestore!",
        updatedAt: serverTimestamp()
      });
      setStatus("✅ Write succeeded!");
    } catch (e: any) {
      console.error(e);
      setStatus("❌ " + e.message);
    }
  };

  return (
    <div className="p-4 bg-purple-800 text-white rounded space-y-2">
      <button
        onClick={write}
        className="px-4 py-2 bg-white text-black rounded"
      >
        Test Firestore Write
      </button>
      <p>{status}</p>
    </div>
  );
}
