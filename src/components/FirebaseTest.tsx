// src/components/FirebaseTest.tsx
"use client";
import { useEffect } from "react";
import { auth, db, functions } from "../firebaseClient";

export default function FirebaseTest() {
  useEffect(() => {
    console.log("🔥 Firebase Auth initialized:", auth !== undefined);
    console.log("🔥 Firestore DB initialized:", db !== undefined);
    console.log("🔥 Functions client initialized:", functions !== undefined);
  }, []);

  return (
    <div className="p-4 bg-gray-800 text-white rounded">
      <h3>Firebase Sanity Check</h3>
      <p>Open your browser’s console to see the initialization logs.</p>
    </div>
  );
}
