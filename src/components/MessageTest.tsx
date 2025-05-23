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
  const [isEditing, setIsEditing] = useState(false);

  // Debug logs
  useEffect(() => {
    console.log("Message changed:", message?.original);
    console.log("Input state:", input);
    console.log("Is editing:", isEditing);
  }, [message, input, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log("Input change:", e.target.value);
    setInput(e.target.value);
  };

  const handleEdit = () => {
    console.log("Edit clicked, current message:", message?.original);
    setInput(message?.original || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    console.log("Cancel clicked, restoring:", message?.original);
    setInput(message?.original || "");
    setIsEditing(false);
  };

  const uid = auth.currentUser?.uid;
  const ref = uid
    ? doc(
        db,
        "ideation",
        "allo-flow-greenpill-money-council",
        "indexes",
        "13",
        "messages",
        uid
      )
    : null;

  const save = async () => {
    if (!ref) return;
    console.log("Saving:", input);
    await setDoc(ref, {
      original: input,
      updatedAt: serverTimestamp(),
    });
    setIsEditing(false);
  };

  const remove = async () => {
    if (!ref) return;
    await deleteDoc(ref);
    setInput("");
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <WalletStatus />
      
      {address && !loading && (
        <div className="p-4 bg-gray-800 text-white rounded space-y-2">
          {!message || isEditing ? (
            <>
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message…"
                className="w-full p-2 text-black min-h-[100px]"
                autoFocus={isEditing}
              />
              <div className="space-x-2">
                <button
                  onClick={save}
                  className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors"
                >
                  Save
                </button>
                {message && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p>Your submission:</p>
              <div className="p-2 bg-gray-700 rounded">{message.original}</div>
              <div className="space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={remove}
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
