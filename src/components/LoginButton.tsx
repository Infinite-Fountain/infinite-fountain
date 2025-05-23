'use client';
import { useAccount } from 'wagmi';
import WalletWrapper from './WalletWrapper';

export default function LoginButton() {
  const { address } = useAccount();

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
