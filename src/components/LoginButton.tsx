'use client';
import { useAccount } from 'wagmi';
import WalletWrapper from './WalletWrapper';
import { useWalletAuth } from '../hooks/useWalletAuth';
import { useEffect } from 'react';

export default function LoginButton() {
  const { address, isConnected } = useAccount();
  const { setShouldAuthenticate } = useWalletAuth();

  useEffect(() => {
    if (isConnected && address) {
      setShouldAuthenticate(true);
    }
  }, [isConnected, address, setShouldAuthenticate]);

  return (
    <WalletWrapper
      className="min-w-[90px]"
      text="Log in"
      withWalletAggregator={false}
      basenamesCache={{}}
      isHolder={false}
    />
  );
}
