'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers'; // Import ethers
import Lottie from 'lottie-react';
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
  const animations = [Animation1, Animation2, Animation3, Animation4, Animation5];

  // Array indicating whether each animation should loop
  const animationLoopSettings = [false, false, false, false, false];

  // State to manage current animation index
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState<number>(0);

  // State to trigger animation playback
  const [animationData, setAnimationData] = useState<any>(null);

  // State to track if animation has played
  const [animationPlayed, setAnimationPlayed] = useState<boolean>(false);

  // State to manage visibility of Prev and Next buttons
  const [showButtons, setShowButtons] = useState<boolean>(false);

  // State to manage visibility of the vote_button
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

  // New state variable for top 10 users' information
  const [top10UserInfos, setTop10UserInfos] = useState<
    { place: string; userInfo: string; balanceInfo: string }[]
  >([]);

  // NEW: State variable to prevent multiple rapid clicks (if needed)
  const [isPrevProcessing, setIsPrevProcessing] = useState(false);

  // NEW: State variable to track if the user has seen the last animation (resets on refresh)
  const [hasSeenLastAnimation, setHasSeenLastAnimation] = useState(false);

  // Initialize ethers provider and contract
  const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  // Fetch all Assigned events to get unique user addresses
  const fetchAllAddresses = async () => {
    try {
      const filter = contract.filters.Assigned();
      const events = await contract.queryFilter(filter, 0, 'latest');

      const addressesSet = new Set<string>();
      events.forEach((event) => {
        if (event.args) {
          const userAddress = event.args.user;
          if (userAddress.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
            addressesSet.add(userAddress);
          }
        }
      });

      return Array.from(addressesSet);
    } catch (err) {
      console.error('Error fetching Assigned events:', err);
      throw err;
    }
  };

  // Fetch balance for a single address
  const fetchBalance = async (userAddress: string) => {
    try {
      const balance = await contract.getCommunityUSDC(userAddress);
      const balanceInCents = balance.div(ethers.BigNumber.from(10000));
      return balanceInCents.toNumber();
    } catch (err) {
      console.error(`Error fetching balance for ${userAddress}:`, err);
      return '--';
    }
  };

  // Fetch Community Pool Balance
  const fetchCommunityPoolBalance = async () => {
    try {
      const poolBalance = await contract.unassignedPoolBalance();
      const formattedBalance = (poolBalance.toNumber() / 1000000).toFixed(0);
      return `$${formattedBalance}`;
    } catch (err) {
      console.error('Error fetching community pool balance:', err);
      return '--';
    }
  };

  useEffect(() => {
    if (address && !animationPlayed) {
      setAnimationData(animations[currentAnimationIndex]);
      setAnimationPlayed(true);
      setShowButtons(true);
      setLoading(true);
      // No need to set isAnimating

      // Fetch data from smart contract
      const fetchData = async () => {
        try {
          const addresses = await fetchAllAddresses();

          if (addresses.length === 0) {
            setError('No Assigned events found.');
            setLoading(false);
            return;
          }

          const balancePromises = addresses.map(async (addr: string) => {
            const balance = await fetchBalance(addr);
            return { address: addr, balance };
          });

          const results = await Promise.all(balancePromises);

          setBalances(results);
          console.log('Fetched Balances:', results);

          const poolBalance = await fetchCommunityPoolBalance();
          setCommunityPoolBalance(poolBalance);
          console.log('Community Pool Balance:', poolBalance);

          const top10Results = results
            .filter((item) => typeof item.balance === 'number')
            .sort((a, b) => (b.balance as number) - (a.balance as number))
            .slice(0, 10);

          setTop10(top10Results);
          console.log('Top 10 Balances:', top10Results);

          const userBalanceObj = results.find(
            (item) => item.address.toLowerCase() === address?.toLowerCase()
          );
          const fetchedUserBalance = userBalanceObj ? userBalanceObj.balance : null;
          setUserBalance(fetchedUserBalance);
          console.log('User Balance:', fetchedUserBalance);

          // Compute and set the top 10 users' information
          let top10UserInfosArray: { place: string; userInfo: string; balanceInfo: string }[] = [];

          for (let i = 0; i < top10Results.length; i++) {
            const place = `${i + 1}${getOrdinalSuffix(i + 1)} place`;
            const ensName = await getEnsName(top10Results[i].address as `0x${string}`);
            const baseName = await getBasename(top10Results[i].address as `0x${string}`);
            const truncatedAddress = truncateWalletAddress(top10Results[i]?.address);
            const userInfo = ensName || baseName || truncatedAddress;
            const balanceInfo =
              typeof top10Results[i]?.balance === 'number' ? top10Results[i].balance.toString() : 'N/A';

            // Populate the top10UserInfosArray
            top10UserInfosArray.push({ place, userInfo, balanceInfo });
          }

          setTop10UserInfos(top10UserInfosArray);
        } catch (err) {
          console.error('Error executing calculations:', err);
          setError('An error occurred while executing calculations.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [address, animationPlayed, currentAnimationIndex, animations, animationLoopSettings]);

  // Function to get ordinal suffix
  const getOrdinalSuffix = (i: number) => {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return 'st';
    }
    if (j === 2 && k !== 12) {
      return 'nd';
    }
    if (j === 3 && k !== 13) {
      return 'rd';
    }
    return 'th';
  };

  // Handler for Next button - now plays the first animation again when at the end.
  // Also, if the user reaches the last animation, mark hasSeenLastAnimation true.
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

  // Handler to open the primary drawer
  const handleVoteButtonClick = () => {
    setDrawerState('primary-open');
  };

  // Handler to close the primary drawer
  const handleClosePrimaryDrawer = () => {
    setDrawerState('closed');
  };

  // Handler to open the secondary drawer
  const handleOpenSecondaryDrawer = () => {
    setDrawerState('secondary-open');
  };

  // Handler to close the secondary drawer and reopen the primary drawer
  const handleCloseSecondaryDrawer = () => {
    setDrawerState('primary-open');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Brown Container (left side) */}
        <div className="brown-container"></div>

        {/* Yellow Container (center) */}
        <div className="yellow-container relative">
          {/* Main Animations */}
          {animationData && (
            <Lottie
              key={currentAnimationIndex} // Force re-mount on animation change
              animationData={animationData}
              loop={animationLoopSettings[currentAnimationIndex]} // true or false
              onComplete={handleNext} // Automatically calls handleNext when animation completes
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
          {/* NEW: Full-screen overlay for left 20% */}
          <button
            onClick={handlePrev}
            className="absolute top-0 left-0 w-[20%] h-full cursor-pointer md:hover:bg-white/20 bg-transparent border-0"
            style={{ zIndex: 15 }}
          ></button>
          {/* NEW: Full-screen overlay for right 20% */}
          <button
            onClick={handleNext}
            className="absolute top-0 right-0 w-[20%] h-full cursor-pointer md:hover:bg-white/20 bg-transparent border-0"
            style={{ zIndex: 15 }}
          ></button>
          {/* NEW: Bottom Menu Animation rendered on top with a higher z-index and pointerEvents disabled */}
          <Lottie
            animationData={BottomMenu}
            loop={true}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 20,
              pointerEvents: 'none'
            }}
          />

          {/* Vote Button */}
          {address && voteButtonVisible && (
            <button
              onClick={handleVoteButtonClick}
              className="vote-button z-20" // Use the class defined in global.css
              aria-label="Vote Button"
            >
              <Image
                src="/buttons/dashboardbutton.png"
                alt="Vote Button"
                width={100}
                height={100}
                className="object-contain"
              />
            </button>
          )}

          {/* Error and Loading Indicators */}
          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded">
              {error}
            </div>
          )}

          {loading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white px-4 py-2 rounded flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Loading...
            </div>
          )}
        </div>

        {/* Red Container (right side) */}
        <div className="red-container">
          {/* Login Buttons */}
          <div className="flex justify-center" style={{ paddingTop: '10px' }}>
            <SignupButton />
            {!address && <LoginButton />}
          </div>
          {/* Prev and Next Buttons moved here */}
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
              <button
                className="next-button px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg ml-4"
                onClick={handleNext}
                aria-label="Next Animation"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        {/* Green Container */}
        <div className="green-container relative">
          {/* Login Buttons */}
          <div
            className="absolute top-0 right-0 flex items-center"
            style={{ paddingTop: '5px', paddingRight: '5px' }}
          >
            <SignupButton />
            {!address && <LoginButton />}
          </div>
        </div>

        {/* Yellow Container */}
        <div className="yellow-container relative">
          {/* Main Animations */}
          {animationData && (
            <Lottie
              key={currentAnimationIndex} // Force re-mount on animation change
              animationData={animationData}
              loop={animationLoopSettings[currentAnimationIndex]} // true or false
              onComplete={handleNext} // Automatically calls handleNext when animation completes
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
          {/* NEW: Full-screen overlay for left 20% */}
          <button
            onClick={handlePrev}
            className="absolute top-0 left-0 w-[20%] h-full cursor-pointer bg-transparent border-0"
            style={{ zIndex: 15 }}
          ></button>
          {/* NEW: Full-screen overlay for right 20% */}
          <button
            onClick={handleNext}
            className="absolute top-0 right-0 w-[20%] h-full cursor-pointer bg-transparent border-0"
            style={{ zIndex: 15 }}
          ></button>
          {/* NEW: Bottom Menu Animation rendered on top with a higher z-index and pointerEvents disabled */}
          <Lottie
            animationData={BottomMenu}
            loop={true}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 20,
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* Blue Container */}
        <div className="blue-container relative">
          {/* Prev and Next Buttons */}
          {showButtons && address && (
            <div
              className="absolute top-0 right-0 z-20"
              style={{ paddingTop: '5px', paddingRight: '5px' }}
            >
              {(currentAnimationIndex !== 0 || hasSeenLastAnimation) && (
                <button
                  className="prev-button px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                  onClick={handlePrev}
                  aria-label="Previous Animation"
                >
                  Prev
                </button>
              )}
              <button
                className="next-button px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition ml-2"
                onClick={handleNext}
                aria-label="Next Animation"
              >
                Next
              </button>
            </div>
          )}

          {/* Vote Button */}
          {address && voteButtonVisible && (
            <button
              onClick={handleVoteButtonClick}
              className="vote-button z-20" // Use the class defined in global.css
              aria-label="Vote Button"
            >
              <Image
                src="/buttons/dashboardbutton.png"
                alt="Vote Button"
                width={100}
                height={100}
                className="object-contain"
              />
            </button>
          )}
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
          <div className="drawer-container w-full h-full relative">
            {/* Lottie Animation */}
            <Lottie
              key="dashboard" // Unique key for dashboard animation
              animationData={DashboardAnimation}
              loop={true} // This animation loops indefinitely
              className="w-full h-full"
            />

            {/* Only render the pool balance if it has been populated */}
            {communityPoolBalance && communityPoolBalance !== '--' && (
              <div
                className="absolute"
                style={{
                  bottom: '53%',
                  left: '34%',
                  fontSize: '40px',
                  fontWeight: 'bold',
                  color: 'black',
                  backgroundColor: 'transparent',
                }}
              >
                {communityPoolBalance} usd
              </div>
            )}

            {/* Render the user's balance */}
            {userBalance !== null && (
              <div
                className="absolute"
                style={{
                  bottom: '7%',
                  left: '8%',
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: 'DarkViolet',
                  backgroundColor: 'transparent',
                }}
              >
                {userBalance}
              </div>
            )}

            {/* Only render the balances if top10 has been populated */}
            {top10.length > 0 && typeof top10[0].balance === 'number' && (
              <div
                className="absolute"
                style={{
                  bottom: '5%',
                  left: '35%',
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: 'black',
                  backgroundColor: 'transparent',
                }}
              >
                {top10[0].balance}
              </div>
            )}

            {top10.length > 1 && typeof top10[1].balance === 'number' && (
              <div
                className="absolute"
                style={{
                  bottom: '5%',
                  left: '51%',
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: 'black',
                  backgroundColor: 'transparent',
                }}
              >
                {top10[1].balance}
              </div>
            )}

            {top10.length > 2 && typeof top10[2].balance === 'number' && (
              <div
                className="absolute"
                style={{
                  bottom: '5%',
                  left: '68%',
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: 'black',
                  backgroundColor: 'transparent',
                }}
              >
                {top10[2].balance}
              </div>
            )}

            {/* Button to Open Secondary Drawer */}
            <button
              onClick={handleOpenSecondaryDrawer}
              className="absolute"
              style={{
                bottom: '4%',
                left: '82%',
                width: '13%',
                height: '13%',
                backgroundColor: 'transparent', // Transparent background as per your requirement
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
              }}
              aria-label="Open Secondary Drawer"
            ></button>
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
          onClick={(e) => e.stopPropagation()} // Prevent click from closing drawer
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
              key="leaderboard" // Unique key for leaderboard animation
              animationData={LeaderboardAnimation}
              loop={true} // This animation loops indefinitely
              className="w-full h-full"
            />

            {/* Render the user's balance */}
            {userBalance !== null && (
              <div
                className="absolute"
                style={{
                  bottom: '4%',
                  left: '63%',
                  fontSize: '25px',
                  fontWeight: 'bold',
                  color: 'MediumPurple',
                  backgroundColor: 'transparent',
                }}
              >
                {userBalance}
              </div>
            )}

            {/* Display the 1st place user */}
            {top10UserInfos.length > 0 && (
              <div
                className="absolute left-[35%] bottom-[90%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[0].userInfo}`}
              </div>
            )}

            {/* Display the 1st place balance */}
            {top10UserInfos.length > 0 && (
              <div
                className="absolute left-[9%] bottom-[89%] text-[18px] md:text-[23px] font-bold text-pink-500 bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[0].balanceInfo}`}
              </div>
            )}

            {/* Display the 2nd place user */}
            {top10UserInfos.length > 1 && (
              <div
                className="absolute left-[42%] bottom-[76%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[1].userInfo}`}
              </div>
            )}

            {/* Display the 2nd place balance */}
            {top10UserInfos.length > 1 && (
              <div
                className="absolute left-[30%] bottom-[75%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[1].balanceInfo}`}
              </div>
            )}

            {/* Display the 3rd place user */}
            {top10UserInfos.length > 2 && (
              <div
                className="absolute left-[47%] bottom-[68%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[2].userInfo}`}
              </div>
            )}

            {/* Display the 3rd place balance */}
            {top10UserInfos.length > 2 && (
              <div
                className="absolute left-[33%] bottom-[67%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[2].balanceInfo}`}
              </div>
            )}

            {/* Display the 4th place user */}
            {top10UserInfos.length > 3 && (
              <div
                className="absolute left-[50%] bottom-[61%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[3].userInfo}`}
              </div>
            )}

            {/* Display the 4th place balance */}
            {top10UserInfos.length > 3 && (
              <div
                className="absolute left-[34%] bottom-[59%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[3].balanceInfo}`}
              </div>
            )}

            {/* Display the 5th place user */}
            {top10UserInfos.length > 4 && (
              <div
                className="absolute left-[54%] bottom-[54%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[4].userInfo}`}
              </div>
            )}

            {/* Display the 5th place balance */}
            {top10UserInfos.length > 4 && (
              <div
                className="absolute left-[36%] bottom-[51%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[4].balanceInfo}`}
              </div>
            )}

            {/* Display the 6th place user */}
            {top10UserInfos.length > 5 && (
              <div
                className="absolute left-[57%] bottom-[46%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[5].userInfo}`}
              </div>
            )}

            {/* Display the 6th place balance */}
            {top10UserInfos.length > 5 && (
              <div
                className="absolute left-[37%] bottom-[43%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[5].balanceInfo}`}
              </div>
            )}

            {/* Display the 7th place user */}
            {top10UserInfos.length > 6 && (
              <div
                className="absolute left-[62%] bottom-[37%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[6].userInfo}`}
              </div>
            )}

            {/* Display the 7th place balance */}
            {top10UserInfos.length > 6 && (
              <div
                className="absolute left-[36%] bottom-[35%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[6].balanceInfo}`}
              </div>
            )}

            {/* Display the 8th place user */}
            {top10UserInfos.length > 7 && (
              <div
                className="absolute left-[66%] bottom-[27%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[7].userInfo}`}
              </div>
            )}

            {/* Display the 8th place balance */}
            {top10UserInfos.length > 7 && (
              <div
                className="absolute left-[32%] bottom-[22%] text-[15px] md:text-[18px] font-bold text-black bg-transparent whitespace-nowrap"
              >
                {`${top10UserInfos[7].balanceInfo}`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
