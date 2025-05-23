"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseClient";

export default function FirebaseHello() {
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "test", "hello"));
        if (snap.exists()) {
          setMessage(snap.data().message);
        } else {
          setMessage("No document found!");
        }
      } catch (err) {
        console.error("Firestore error:", err);
        setMessage("Error fetching data");
      }
    })();
  }, []);

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">Firebase Test</h2>
      <p>{message}</p>
    </div>
  );
}
