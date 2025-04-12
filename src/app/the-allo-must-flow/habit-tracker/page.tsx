'use client';
import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers'; // Import ethers
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import Image from 'next/image';
import LoginButton from '../../../components/LoginButton';
import SignupButton from '../../../components/SignupButton';
import abi from './abi.json'; // Import ABI from the JSON file
import '../.././global.css';
import { getBasename, type Basename } from '../../../basenames';
import { getEnsName } from '../../../ensnames';
import { truncateWalletAddress } from '../../../utils'; // Assuming you have this utility function

// Import your animations
import Animation1 from './animations/animation1.json';
import Animation2 from './animations/animation2.json';
import Animation3 from './animations/animation3.json';
import Animation4 from './animations/animation4.json';
import Animation5 from './animations/animation5.json';
import Animation6 from './animations/animation6.json';
import Animation7 from './animations/animation7.json';
import BottomMenu from './animations/bottom-menu.json'; // NEW: Import bottom-menu animation

import DashboardAnimation from './animations/dashboard.json';
import LeaderboardAnimation from './animations/leaderboard.json';

// Define constants
const ALCHEMY_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_API_URL;
const CONTRACT_ADDRESS = '0xfe3Fc6cb04bA5958b0577a0c6528269964e7C8bF'; // Your contract address

export default function Page() {
  const { address } = useAccount();

  // Array of animations in order
  const animations = [Animation1, Animation2];

  // Array indicating whether each animation should loop
  const animationLoopSettings = [false, false];

  // State to manage current animation index
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState<number>(0);

  // State to trigger animation playback
  const [animationData, setAnimationData] = useState<any>(null);

  // State to track if animation has played
  const [animationPlayed, setAnimationPlayed] = useState<boolean>(false);

  // State to manage visibility of Prev and Next buttons
  const [showButtons, setShowButtons] = useState<boolean>(false);

  // State to manage visibility of the vote_button (removed in this task)
  const [voteButtonVisible, setVoteButtonVisible] = useState<boolean>(true);

  // State to manage drawer states
  const [drawerState, setDrawerState] = useState<'closed' | 'primary-open' | 'secondary-open'>('closed');

  // State to store balances
  const [balances, setBalances] = useState<{ address: string; balance: number }[]>([]);

  const [userBalance, setUserBalance] = useState<number | null>(null);

  // State to store community pool balance
  const [communityPoolBalance, setCommunityPoolBalance] = useState<string>('');

  // State to handle errors
  const [error, setError] = useState<string | null>(null);

  // State to handle loading
  const [loading, setLoading] = useState<boolean>(false);

  // New state variable to store the top basename
  const [topBasename, setTopBasename] = useState<Basename | null>(null);

  const [top10, setTop10] = useState<{ address: string; balance: number }[]>([]);

  // New state variable for top 10 users' information (extra displays removed)
  const [top10UserInfos, setTop10UserInfos] = useState<
    { place: string; userInfo: string; balanceInfo: string }[]
  >([]);

  // NEW: State variable to prevent multiple rapid clicks (if needed)
  const [isPrevProcessing, setIsPrevProcessing] = useState(false);

  // NEW: State variable to track if the user has seen the last animation (resets on refresh)
  const [hasSeenLastAnimation, setHasSeenLastAnimation] = useState(false);

  // NEW: Ref for the main Lottie instance to control play/pause
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  // NEW: State to control whether the animation is paused
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);

  // Initialize ethers provider and contract
  const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  // Modified useEffect: Removed the "address &&" check so that animations are visible regardless of wallet connection.
  useEffect(() => {
    if (!animationPlayed) {
      setAnimationData(animations[currentAnimationIndex]);
      setAnimationPlayed(true);
      setShowButtons(true);
      setLoading(true);
    }
  }, [animationPlayed, currentAnimationIndex, animations, animationLoopSettings]);

  // Function to get ordinal suffix
  const getOrdinalSuffix = (i: number) => {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  // Handler for Next button
  const handleNext = () => {
    const nextIndex = currentAnimationIndex === animations.length - 1 ? 0 : currentAnimationIndex + 1;
    if (currentAnimationIndex === animations.length - 1) {
      setHasSeenLastAnimation(true);
    }
    setCurrentAnimationIndex(nextIndex);
    setAnimationData(animations[nextIndex]);
  };

  // Handler for Prev button (with processing guard)
  const handlePrev = () => {
    if (isPrevProcessing) return;
    setIsPrevProcessing(true);
    setCurrentAnimationIndex((prevIndex) => {
      const newIndex = prevIndex === 0 && hasSeenLastAnimation ? animations.length - 1 : prevIndex - 1;
      setAnimationData(animations[newIndex]);
      return newIndex;
    });
    setTimeout(() => setIsPrevProcessing(false), 100);
  };

  // Handler for Play/Pause button (toggles state)
  const handlePlayPause = () => {
    setIsAnimationPaused(!isAnimationPaused);
  };

  // useEffect to control play/pause on the Lottie instance
  useEffect(() => {
    if (lottieRef.current) {
      if (isAnimationPaused) {
        lottieRef.current.pause();
      } else {
        lottieRef.current.play();
      }
    }
  }, [isAnimationPaused]);

  // Drawer handlers (vote button removed)
  const handleClosePrimaryDrawer = () => {
    setDrawerState('closed');
  };
  const handleOpenSecondaryDrawer = () => {
    setDrawerState('secondary-open');
  };
  const handleCloseSecondaryDrawer = () => {
    setDrawerState('primary-open');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Mobile Green Container (Login/User Wallet) - in normal flow to push yellow down */}
      <div className="green-container md:hidden">
        <div className="flex justify-end items-center" style={{ padding: '5px' }}>
          <SignupButton />
          {!address && <LoginButton />}
        </div>
      </div>

      {/* Single Lottie Container (Yellow Container) - shown on all viewports */}
      <div className="yellow-container relative block">
        {/* Main Animation */}
        {animationData && (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={animationLoopSettings[currentAnimationIndex]}
            onComplete={!isAnimationPaused ? handleNext : undefined}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 10,
            }}
          />
        )}
        {/* Full-screen overlay for left 20% */}
        <button
          onClick={handlePrev}
          className="absolute top-0 left-0 w-[20%] h-full cursor-pointer bg-transparent border-0"
          style={{ zIndex: 15 }}
        ></button>
        {/* Full-screen overlay for right 20% */}
        <button
          onClick={handleNext}
          className="absolute top-0 right-0 w-[20%] h-full cursor-pointer bg-transparent border-0"
          style={{ zIndex: 15 }}
        ></button>
        {/* Full-screen overlay for play/pause button in the center (60% width) */}
        <button
          onClick={handlePlayPause}
          className="absolute top-0 left-[20%] w-[60%] h-full cursor-pointer bg-transparent border-0"
          style={{ zIndex: 15 }}
        ></button>
        {/* Bottom Menu was removed */}
        {/* Vote Button removed */}
      </div>

      {/* Desktop-only Red Container */}
      <div className="hidden md:block red-container">
        {/* Login Buttons */}
        <div className="flex justify-center" style={{ paddingTop: '10px' }}>
          <SignupButton />
          {!address && <LoginButton />}
        </div>
        {/* Prev and Next Buttons */}
        {showButtons && address && (
          <div className="flex justify-center mt-4">
            {(currentAnimationIndex !== 0 || hasSeenLastAnimation) && (
              <button
                className="prev-button px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg"
                onClick={handlePrev}
                aria-label="Previous Animation"
              >
                Prev
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        {/* Blue Container */}
        <div className="blue-container relative">
          {/* Prev and Next Buttons */}
          {showButtons && address && (
            <div className="absolute top-0 right-0 z-20" style={{ paddingTop: '5px', paddingRight: '5px' }}>
              {(currentAnimationIndex !== 0 || hasSeenLastAnimation) && (
                <button
                  className="prev-button px-2 py-1 bg-transparent text-white rounded hover:bg-gray-600 transition"
                  onClick={handlePrev}
                  aria-label="Previous Animation"
                >
                  Prev
                </button>
              )}
            </div>
          )}
          {/* Vote Button removed */}
        </div>
      </div>

      {/* Primary Drawer */}
      <div
        className={`fixed inset-0 z-40 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${
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
          onClick={(e) => e.stopPropagation()}
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
          <div className="drawer-container w-full h-full relative">
            {/* Lottie Animation */}
            <Lottie
              key="dashboard"
              animationData={DashboardAnimation}
              loop={true}
              className="w-full h-full"
            />
            {/* Extra displays removed */}
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
              key="leaderboard"
              animationData={LeaderboardAnimation}
              loop={true}
              className="w-full h-full"
            />
            {/* Extra displays removed */}
          </div>
        </div>
      </div>
    </div>
  );
}
