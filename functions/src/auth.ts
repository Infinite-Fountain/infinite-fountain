import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { ethers } from "ethers";

// Initialize the Admin SDK (only once per project)
admin.initializeApp();

interface TokenRequest {
  wallet: string;
  signature: string;
  nonce: string;
}

export const createCustomToken = onCall(async (request) => {
  const { wallet, signature, nonce } = request.data as TokenRequest;

  // Use ethers v6 verifyMessage
  const recovered = ethers.verifyMessage(nonce, signature);
  if (recovered.toLowerCase() !== wallet.toLowerCase()) {
    throw new Error("Signature mismatch");
  }

  const uid = wallet.toLowerCase();

  // Ensure the user exists in Auth
  try {
    await admin.auth().getUser(uid);
  } catch {
    await admin.auth().createUser({ uid });
  }

  // Mint and return a custom token
  const token = await admin.auth().createCustomToken(uid, {
    provider: "metamask",
  });
  return { token };
}); 