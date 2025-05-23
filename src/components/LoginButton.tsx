'use client';
import { useAccount, useConnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';

export default function LoginButton() {
  const { address } = useAccount();
  const { connect } = useConnect();

  // Only show the button if not connected
  if (address) return null;

  return (
    <button
      onClick={() => connect({ connector: metaMask() })}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Connect Wallet
    </button>
  );
}
