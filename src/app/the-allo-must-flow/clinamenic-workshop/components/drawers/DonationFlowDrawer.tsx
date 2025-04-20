import React, { useState, useEffect, useMemo } from 'react';
import donationFlow from '../../configs/donationFlow.json';
import { ethers } from 'ethers';

interface DonationFlowDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  donationAmount: string;
}

const DonationFlowDrawer: React.FC<DonationFlowDrawerProps> = ({ isOpen, onClose, donationAmount }) => {
  const [donationStep, setDonationStep] = useState<number>(0);
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContractAddress, setCurrentContractAddress] = useState<string | null>(null);

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

  const handleNetworkSelect = async (network: any) => {
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

  const handleTokenSelect = (token: any) => {
    setSelectedToken(token);
    setDonationStep(3);
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
            {sortedNetworks.map((network: any) => (
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
        </div>
      );
    }
    if (donationStep === 2 && selectedNetwork) {
      const sortedTokens = selectedNetwork.tokens.sort((a: any, b: any) => a.order - b.order);
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
            {sortedTokens.map((token: any) => (
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
