import React, { useState, useEffect, useMemo } from 'react';
import donationFlow from '../../configs/donationFlow.json';

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

  const handleNetworkSelect = (network: any) => {
    setSelectedNetwork(network);
    // Additional logic for network selection can be added here
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
        {/* Header for Donation Amount */}
        <h2 className="text-white text-center text-2xl mt-4">Donating ${donationAmount} USD</h2>

        {/* Display Network Options */}
        <div className="donation-flow flex flex-col items-center justify-center bg-black bg-opacity-80" style={{ width: "100%", height: "100%" }}>
          <h2 className="text-white mb-4">Select a Network</h2>
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
      </div>
    </div>
  );
};

export default DonationFlowDrawer;
