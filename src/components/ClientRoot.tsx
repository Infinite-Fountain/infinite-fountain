"use client";

import dynamic from "next/dynamic";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { WagmiConfig } from "wagmi";
import { useWagmiConfig } from "../wagmi";

const OnchainProviders = dynamic(
  () => import("./OnchainProviders"),
  { ssr: false }
);

// Separate component to use the hook inside WagmiConfig
function WalletAuthWrapper({ children }: { children: React.ReactNode }) {
  useWalletAuth();  // Now this will have access to Wagmi context
  return <>{children}</>;
}

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const config = useWagmiConfig();
  return (
    <WagmiConfig config={config}>
      <OnchainProviders>
        <WalletAuthWrapper>{children}</WalletAuthWrapper>
      </OnchainProviders>
    </WagmiConfig>
  );
} 