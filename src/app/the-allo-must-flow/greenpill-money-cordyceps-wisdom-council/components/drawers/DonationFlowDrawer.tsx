import React, { useState, useEffect, useMemo } from 'react';
import donationFlow from '../../configs/donationFlow.json';
import { ethers } from 'ethers';

interface DonationFlowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  donationAmount: string;
}

interface Network {
  name: string;
  order: number;
  contractAddress?: string;
  chainId?: number;
  tokens: Token[];
}

interface Token {
  name: string;
  token_contract: string;
  order: number;
  conversionFactor?: string | number;
  eip2612?: boolean;
}

const DonationFlowDrawer: React.FC<DonationFlowDrawerProps> = ({ isOpen, onClose, donationAmount }) => {
  const [donationStep, setDonationStep] = useState<number>(0);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContractAddress, setCurrentContractAddress] = useState<string | null>(null);
  const [ethAmount, setEthAmount] = useState<string>("");

  // Initialize ethers providers and contracts
  const ALCHEMY_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_API_URL;
  const alchemyProvider = useMemo(() => {
    if (ALCHEMY_API_URL) {
      return new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);
    }
    return null;
  }, [ALCHEMY_API_URL]);

  const sortedNetworks = useMemo(() => {
    return donationFlow.networkSelection.networks.sort((a: any, b: any) => a.order - b.order);
  }, []);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
    }
  }, [isOpen, donationAmount]);

  const networkToPlatformId: Record<string, string> = {
    base: 'base',
    optimism: 'optimism',
    arbitrum: 'arbitrum-one',
    celo: 'celo',
    polygon: 'polygon-pos',
  };

  const handleNetworkSelect = async (network: Network) => {
    setSelectedNetwork(network);
    if (network.chainId && network.chainId !== 0 && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(network.chainId) }],
        });
      } catch (switchError: any) {
        console.error("Switch chain error:", switchError);
        alert("The network was NOT successfully changed. Please do it manually in your wallet.");
        setError(switchError.message);
      }
    }
    if (network.contractAddress) {
      setCurrentContractAddress(network.contractAddress);
    }
    setDonationStep(2);
  };

  const handleTokenSelect = async (token: Token) => {
    setSelectedToken(token);
    setDonationStep(3);

    // Fetch token price using CoinGecko API by contract address
    try {
      const contractAddress = token.token_contract.toLowerCase();
      const platformId = networkToPlatformId[selectedNetwork?.name.toLowerCase() || ''];
      const url = contractAddress
        ? `https://api.coingecko.com/api/v3/simple/token_price/${platformId}?contract_addresses=${contractAddress}&vs_currencies=usd`
        : `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching token price:", errorText);
        return;
      }
      const data = await response.json();
      console.log("API Response:", data); // Log the entire API response
      const price = contractAddress ? data[contractAddress]?.usd : data['ethereum']?.usd;
      if (price) {
        console.log(`Current ${token.name} price: ${price} USD`); // Log the token price
        const amountInToken = (parseFloat(donationAmount) / price).toFixed(6);
        setEthAmount(amountInToken);
      } else {
        console.error(`Price for ${token.name} not found.`);
      }
    } catch (error) {
      console.error("Error fetching token price:", error);
    }
  };

  const handleGoBack = () => {
    if (donationStep === 0) {
      onClose(); // Close the current drawer
      // Logic to open the DonationChartDrawer
      // This might involve setting a state or calling a function to open the DonationChartDrawer
    } else {
      setDonationStep((prevStep) => Math.max(prevStep - 1, 0));
      setEthAmount(""); // Reset the token price query
    }
  };

  const renderDonationFlow = () => {
    if (donationStep === 0 || donationStep === 1) {
      return (
        <div className="donation-flow flex flex-col items-center justify-center bg-opacity-80" style={{ width: "100%", height: "100%" }}>
          <h2 className="text-black mb-4">Select a Network</h2>
          <div
            className="grid"
            style={{
              gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {sortedNetworks.map((network: Network) => (
              network.order !== 0 && (
                <button
                  key={network.name}
                  className="network-btn bg-blue-500 text-white rounded"
                  style={{ width: "100%", height: "100%" }}
                  onClick={() => handleNetworkSelect(network)}
                >
                  {network.name}
                </button>
              )
            ))}
          </div>
          <button
            className="go-back-btn bg-gray-500 text-white rounded mt-4"
            style={{ position: "absolute", bottom: "10px", right: "10px" }}
            onClick={handleGoBack}
          >
            Go Back
          </button>
        </div>
      );
    }
    if (donationStep === 2 && selectedNetwork) {
      const sortedTokens = selectedNetwork.tokens.sort((a: Token, b: Token) => a.order - b.order);
      return (
        <div className="donation-flow flex flex-col items-center justify-center bg-opacity-80" style={{ width: "100%", height: "100%" }}>
          <h2 className="text-black mb-4">Please select the Token you want to donate:</h2>
          <div
            className="grid"
            style={{
              gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {sortedTokens.map((token: Token) => (
              token.order !== 0 && (
                <button
                  key={token.name}
                  className="token-btn bg-purple-500 text-white rounded"
                  style={{ width: "100%", height: "100%" }}
                  onClick={() => handleTokenSelect(token)}
                >
                  {token.name}
                </button>
              )
            ))}
          </div>
          <button
            className="go-back-btn bg-gray-500 text-white rounded mt-4"
            style={{ position: "absolute", bottom: "10px", right: "10px" }}
            onClick={handleGoBack}
          >
            Go Back
          </button>
        </div>
      );
    }
    if (donationStep === 3 && selectedToken) {
      const formattedAmount = parseFloat(ethAmount).toFixed(selectedToken.name === 'BTC' || selectedToken.name === 'ETH' || selectedToken.name === 'wBTC' ? 7 : 1);
      return (
        <div className="donation-flow flex flex-col items-center justify-center bg-opacity-80" style={{ width: "100%", height: "100%" }}>
          <h2 className="text-black mb-4">Donating {formattedAmount} {selectedToken.name} = {donationAmount} USD</h2>
          <button
            className="go-back-btn bg-gray-500 text-white rounded mt-4"
            style={{ position: "absolute", bottom: "10px", right: "10px" }}
            onClick={handleGoBack}
          >
            Go Back
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-y-0' : 'translate-y-[100vh]'
      }`}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Drawer Content */}
      <div
        className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing drawer
      >
        {/* White Card */}
        <div className="bg-white w-10/12 h-5/6 rounded-lg shadow-md mx-auto mt-4 mb-4 flex flex-col items-center justify-start">
          {/* Header for Donation Amount */}
          <div className="text-black text-center text-2xl mt-20 mb-2">Donating ${donationAmount} USD</div>

          {/* Display Network Options */}
          {renderDonationFlow()}
        </div>
      </div>
    </div>
  );
};

export default DonationFlowDrawer;
