"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseClient";
import { useMessage } from "../hooks/useMessage";

function WalletStatus() {
  const { address } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="p-4 bg-gray-800 text-white rounded space-y-4">
      {address ? (
        <div className="space-y-2">
          <p>Connected Wallet:</p>
          <p className="font-mono text-sm bg-gray-700 p-2 rounded">{address}</p>
          <button
            onClick={() => disconnect()}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <>
          <p>Please connect your wallet to continue.</p>
          <button
            onClick={() => connect({ connector: metaMask() })}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Connect MetaMask
          </button>
        </>
      )}
    </div>
  );
}

export default function MessageTest() {
  const { address } = useAccount();
  const { message, loading } = useMessage(
    "allo-flow-greenpill-money-council",
    "13"
  );
  const [input, setInput] = useState("");

  // Sync input to existing message
  useEffect(() => {
    if (message?.original) setInput(message.original);
  }, [message]);

  const save = async () => {
    if (!auth.currentUser) return;
    const ref = doc(
      db,
      "ideation",
      "allo-flow-greenpill-money-council",
      "indexes",
      "13",
      "messages",
      auth.currentUser.uid
    );
    await setDoc(ref, { original: input, updatedAt: serverTimestamp() });
  };

  const remove = async () => {
    if (!auth.currentUser) return;
    const ref = doc(
      db,
      "ideation",
      "allo-flow-greenpill-money-council",
      "indexes",
      "13",
      "messages",
      auth.currentUser.uid
    );
    await deleteDoc(ref);
    setInput("");
  };

  return (
    <div className="space-y-4">
      <WalletStatus />
      
      {address && !loading && (
        <div className="p-4 bg-gray-800 text-white rounded space-y-2">
          {!message ? (
            <>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message…"
                className="w-full p-2 text-black"
              />
              <button onClick={save} className="px-4 py-2 bg-green-500 rounded">
                Submit
              </button>
            </>
          ) : (
            <>
              <p>Your submission:</p>
              <div className="p-2 bg-gray-700 rounded">{message.original}</div>
              <button onClick={() => setInput(message.original)} className="underline">
                Edit
              </button>
              <button onClick={remove} className="px-2 py-1 bg-red-600 rounded ml-2">
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
