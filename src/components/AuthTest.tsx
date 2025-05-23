"use client";

import { useEffect, useState } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";

export default function AuthTest() {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    // one-time anonymous sign-in
    signInAnonymously(auth).catch(console.error);

    // listener shows we're authenticated
    const unsub = onAuthStateChanged(auth, user => {
      setUid(user ? user.uid : null);
    });
    return unsub;
  }, []);

  return (
    <div className="p-4 bg-blue-900 text-white rounded mt-4">
      <h2 className="font-semibold mb-1">Auth Test</h2>
      {uid ? `Signed in anonymously as: ${uid}` : "Signing in…"}
    </div>
  );
} 