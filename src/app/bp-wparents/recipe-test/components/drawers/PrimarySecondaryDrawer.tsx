import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

// Define the props interface
interface PrimarySecondaryDrawerProps {
  drawerState: 'closed' | 'primary-open' | 'secondary-open';
  handleClosePrimaryDrawer: () => void;
  handleCloseSecondaryDrawer: () => void;
  primaryAnimationData: any;
  secondaryAnimationData: any;
  loading: boolean;
  communityPoolBalance: string;
  userBalance: number | null;
  top10: { address: string; balance: number }[];
  top10UserInfos: { place: string; userInfo: string; balanceInfo: string }[];
  calculateCompletionPercentage: () => string;
}

const PrimarySecondaryDrawer: React.FC<PrimarySecondaryDrawerProps> = ({
  drawerState,
  handleClosePrimaryDrawer,
  handleCloseSecondaryDrawer,
  primaryAnimationData,
  secondaryAnimationData,
  loading,
  communityPoolBalance,
  userBalance,
  top10,
  top10UserInfos,
  calculateCompletionPercentage,
}) => {
  return (
    <>
      {/* Primary Drawer */}
      <div
        className={`fixed inset-0 z-40 flex items-center justify-center transition-transform duration-300 ease-in-out transform ${
          drawerState === 'primary-open' ? 'translate-y-0' : 'translate-y-[100vh]'
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${
            drawerState === 'primary-open' ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
          onClick={drawerState === 'primary-open' ? handleClosePrimaryDrawer : undefined}
        ></div>

        {/* Drawer Content */}
        <div
          className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square"
          onClick={(e) => e.stopPropagation()} // Prevent click from closing drawer
        >
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 text-white text-xl focus:outline-none focus:ring-2 focus:ring-white rounded"
            onClick={handleClosePrimaryDrawer}
            aria-label="Close Primary Drawer"
          >
            &times;
          </button>

          {/* Drawer Container */}
          <div className="drawer-container w-full h-full relative flex items-center justify-center">
            {/* Lottie Animation */}
            <Lottie
              animationData={primaryAnimationData}
              loop
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Secondary Drawer */}
      <div
        className={`fixed inset-0 z-50 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${
          drawerState === 'secondary-open' ? 'translate-y-0' : 'translate-y-[100vh]'
        }`}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${
            drawerState === 'secondary-open' ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
          onClick={drawerState === 'secondary-open' ? handleCloseSecondaryDrawer : undefined}
        ></div>

        {/* Drawer Content */}
        <div
          className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 text-white text-xl focus:outline-none focus:ring-2 focus:ring-white rounded"
            onClick={handleCloseSecondaryDrawer}
            aria-label="Close Secondary Drawer"
          >
            &times;
          </button>

          {/* Drawer Container */}
          <div className="drawer-container w-full h-full relative">
            {/* Leaderboard Lottie Animation */}
            <Lottie
              animationData={secondaryAnimationData}
              loop
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PrimarySecondaryDrawer;
