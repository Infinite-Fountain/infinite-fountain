"use client";

import { doc } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseClient";

export function useMessage(expId: string, idx: string) {
  // 1) react-firebase-hooks will re-render when auth state changes
  const [user, authLoading] = useAuthState(auth);

  // 2) build the docRef only when we have a user
  const docRef = user
    ? doc(
        db,
        "ideation",
        expId,
        "indexes",
        idx,
        "messages",
        user.uid
      )
    : null;

  // 3) subscribe to the document
  const [snapshot, loading, error] = useDocument(docRef, {
    snapshotListenOptions: { includeMetadataChanges: false },
  });

  // 4) what we return
  return {
    // wait for both auth and firestore
    loading: authLoading || loading,
    error,
    message: snapshot?.data() as {
      original: string;
      updatedAt: Date;
    } | null,
  };
} 