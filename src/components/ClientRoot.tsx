"use client";

import dynamic from "next/dynamic";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { WagmiConfig } from "wagmi";
import { useWagmiConfig } from "../wagmi";
import { useEffect } from "react";

const OnchainProviders = dynamic(
  () => import("./OnchainProviders"),
  { ssr: false }
);

// Separate component to use the hook inside WagmiConfig
function WalletAuthWrapper({ children }: { children: React.ReactNode }) {
  const { setShouldAuthenticate } = useWalletAuth();  // Get the authentication control
  
  // Only attempt authentication when explicitly requested
  useEffect(() => {
    // You can add logic here to determine when to authenticate
    // For example, you might want to authenticate when a user clicks a login button
    // For now, we'll leave it disabled by default
    // setShouldAuthenticate(true);
  }, []);

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