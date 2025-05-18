'use client';
import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers'; // Import ethers
import Lottie from 'lottie-react';
import Image from 'next/image';
import LoginButton from '../../../components/LoginButton';
import SignupButton from '../../../components/SignupButton';
import abi from './abi.json'; // Import ABI from the JSON file
// New import for the members NFT contract ABI
import allominatiAbi from './abi-allominati.json';
import '../.././global.css';
import { getBasename, type Basename } from '../../../basenames';
import { getEnsName } from '../../../ensnames';
import { truncateWalletAddress } from '../../../utils'; // Assuming you have this utility function

// **Import and initialize Supabase Client**
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import your animations
import Gate1 from './animations/gate1.json';
import Gate2 from './animations/gate2.json';
import Animation1 from './animations/animation1.json';
import Animation2 from './animations/animation2.json';
import Animation3 from './animations/animation3.json';
import Animation4 from './animations/animation4.json';
import Animation5 from './animations/animation5.json';
import Animation6 from './animations/animation6.json';
import Animation7 from './animations/animation7.json';
import Animation8 from './animations/animation8.json';
import Animation9 from './animations/animation9.json';
import Animation10 from './animations/animation10.json';
import Animation11 from './animations/animation11.json';
import Animation12 from './animations/animation12.json';
import Animation13 from './animations/animation13.json';
import Animation14 from './animations/animation14.json';
import Animation15 from './animations/animation15.json';
import BottomMenu from './animations/bottom-menu.json'; // NEW: Import bottom-menu animation

import DashboardAnimation from './animations/dashboard.json';
import LeaderboardAnimation from './animations/leaderboard.json';

import TableOfContentDrawer from './components/drawers/TableOfContentDrawer';

// Import the DonationChartDrawer component
import DonationChartDrawer from './components/drawers/DonationChartDrawer';

// Import the DonationFlowDrawer component
import DonationFlowDrawer from './components/drawers/DonationFlowDrawer';

// Import the ImproveButton animation
import ImproveButton from './animations/improve_button.json';

// Import the VoteDrawer component
import VoteDrawer from './components/drawers/VoteDrawer';

import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Define constants
const ALCHEMY_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_API_URL;
const CONTRACT_ADDRESS = '0x654dff96c6759f1e3218c384767528eec937a55c'; // Your contract address

// New constants for mainnet and the members NFT contract:
const ALCHEMY_MAINNET_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_API_URL;
const MEMBERS_NFT_CONTRACT = '0xcCf223a3Bb40173E1AB9262ad0d04C5bf3Ea32f5';

// Utility function to add a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Define the type for the config object
interface VoteButtonConfig {
  multiplier: number;
}

interface Config {
  community_usdc_per_vote: number;
  tag: string;
  concept: string;
  vote_recipients_share: { address: string; share: number }[];
  vote_button_1: VoteButtonConfig;
  vote_button_2: VoteButtonConfig;
  vote_button_3: VoteButtonConfig;
  vote_button_4: VoteButtonConfig;
}

// Import JSON configuration with type assertion
import config from './configs/MainVoteConfig.json';

// Function to dynamically load the voting config based on the current animation index
const loadVotingConfig = async (index: number) => {
  try {
    const config = await import(`./configs/Index${index}voting.json`);
    return config;
  } catch (error) {
    console.error('Error loading voting config:', error);
    return null;
  }
};

import { narrationSources } from './audioConfig';
import MuteButton from './components/MuteButton';
import TranscriptButton from './components/TranscriptButton';
import { TOKEN_GATED } from './config';

// Custom hook for token gating
function useTokenGate() {
  const { address } = useAccount();
  const [isChecking, setIsChecking] = useState(TOKEN_GATED);
  const [isVerified, setIsVerified] = useState(!TOKEN_GATED);
  const [gateError, setGateError] = useState<string | null>(null);

  // Initialize mainnet provider
  const mainnetProvider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_API_URL);

  useEffect(() => {
    if (!TOKEN_GATED || !address) {
      setIsVerified(true);
      setIsChecking(false);
      return;
    }

    const checkTokenStatus = async () => {
      try {
        // First check Supabase
        const { data } = await supabase
          .from('pools_members')
          .select('allominati')
          .eq('wallet_address', address.toLowerCase())
          .maybeSingle();

        if (data?.allominati) {
          setIsVerified(true);
          setIsChecking(false);
          return;
        }

        // If not in Supabase, check on-chain
        const contract = new ethers.Contract(
          MEMBERS_NFT_CONTRACT,
          allominatiAbi,
          mainnetProvider
        );
        const balance = await contract.balanceOf(address);
        
        if (balance.gt(0)) {
          // Update Supabase with the verified status
          await supabase.from('pools_members').upsert({
            wallet_address: address.toLowerCase(),
            allominati: true,
          });
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
      } catch (error: any) {
        console.error('Token gate error:', error);
        setGateError(error.message || 'Failed to verify token ownership');
      } finally {
        setIsChecking(false);
      }
    };

    checkTokenStatus();
  }, [address, mainnetProvider]);

  return { isChecking, isVerified, gateError };
}

export default function Page() {
  const { address } = useAccount();
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(true);

  // Use the token gate hook
  const { isChecking, isVerified, gateError } = useTokenGate();

  // Array of animations in order
  const animations = [Gate1, Gate2, Animation1, Animation2, Animation3, Animation4, Animation5, Animation6, Animation7, Animation8, Animation9, Animation10, Animation11, Animation12, Animation13, Animation14, Animation15];

  // Array indicating whether each animation should loop
  const animationLoopSettings = [true, false, false, true, true, false, true, true, true, true, true, true, true, true, true, true, true];

  // New array for controlling animation navigation
  const navigationIndex = [3, 4, 6, 7, 8, 9, 10];

  // State to manage current animation index
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState<number>(TOKEN_GATED ? 0 : 2);

  // State to trigger animation playback
  const [animationData, setAnimationData] = useState<any>(null);

  // State to track if animation has played
  const [animationPlayed, setAnimationPlayed] = useState<boolean>(false);

  // State to manage visibility of Prev and Next buttons
  const [showButtons, setShowButtons] = useState<boolean>(true);

  // State to manage visibility of the vote_button
  const [voteButtonVisible, setVoteButtonVisible] = useState<boolean>(true);

  // State to manage drawer states
  const [drawerState, setDrawerState] = useState<'closed' | 'primary-open' | 'secondary-open' | 'table-of-contents-open'>('closed');

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

  // State to track if user balance has been found
  const [userBalanceFound, setUserBalanceFound] = useState<boolean>(false);

  // Add a ref to track if fetchData has been executed
  const fetchDataExecuted = useRef(false);

  // Initialize ethers provider and contract (for base network)
  const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  // New: Initialize mainnet provider and members NFT contract (for NFT onchain checking)
  const mainnetProvider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_API_URL);
  const membersNFTContract = new ethers.Contract(MEMBERS_NFT_CONTRACT, allominatiAbi, mainnetProvider);

  // State to store fetched basenames
  const [basenamesCache, setBasenamesCache] = useState<{ [address: string]: string }>({});

  // Modify the logic to check basenamesCache before fetching
  const fetchUserInfo = async (address: string): Promise<string> => {
    if (basenamesCache[address]) {
      return basenamesCache[address];
    }
    const ensName = await getEnsName(address as `0x${string}`);
    const baseName = await getBasename(address as `0x${string}`);
    const truncatedAddress = truncateWalletAddress(address);
    const userInfo = ensName || baseName || truncatedAddress;
    setBasenamesCache(prev => ({ ...prev, [address]: userInfo }));
    return userInfo;
  };

  // --- Existing function: Fetch all Assigned events to get unique user addresses ---
  const fetchAllAddresses = async () => {
    try {
      const filter = contract.filters.Assigned();
      const events = await contract.queryFilter(filter, 0, 'latest');

      const addressesSet = new Set<string>();
      events.forEach((event) => {
        if (event.args) {
          const userAddress = event.args.user;
          if (userAddress.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
            addressesSet.add(userAddress.toLowerCase());
          }
        }
      });

      return Array.from(addressesSet);
    } catch (err) {
      console.error('Error fetching Assigned events:', err);
      throw err;
    }
  };

  // --- New function: Fetch NFT holders from the MEMBERS_NFT_CONTRACT using mainnet ---
  const fetchMembersNFTHolders = async () => {
    try {
      // Using the standard ERC721 Transfer event as an example.
      const filter = membersNFTContract.filters.Transfer();
      const events = await membersNFTContract.queryFilter(filter, 0, 'latest');
      const holdersSet = new Set<string>();
      events.forEach((event) => {
        if (event.args && event.args.to) {
          holdersSet.add(event.args.to.toLowerCase());
        }
      });
      return Array.from(holdersSet);
    } catch (err) {
      console.error('Error fetching NFT holders:', err);
      return [];
    }
  };

  // --- Existing function: Fetch balance for a single address ---
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

  // --- Existing function: Fetch Community Pool Balance ---
  const fetchCommunityPoolBalance = async () => {
    try {
      await delay(500); // 500ms delay before fetching community pool balance
      const poolBalance = await contract.totalPoolBalance();
      const formattedBalance = (poolBalance.toNumber() / 1000000).toFixed(0);
      const balanceString = `$${formattedBalance}`;
      return balanceString;
    } catch (err) {
      console.error('Error fetching community pool balance:', err);
      return '--';
    }
  };

  // --- New Function: Check NFT status using Supabase and on-chain events ---
  const checkNFTStatus = async () => {
    if (!address) return;
    try {
      // 1. Query Supabase for the connected wallet
      let { data } = await supabase
        .from('pools_members')
        .select('allominati')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle();
      
      if (data && data.allominati === true) {
        setUserBalanceFound(true);
        return;
      }

      // 2. If not found or false, fetch on-chain NFT holders using the mainnet contract
      const onChainHolders = await fetchMembersNFTHolders();

      // 3. Insert missing addresses into Supabase with allominati true.
      for (const holder of onChainHolders) {
        await supabase
          .from('pools_members')
          .insert([{ wallet_address: holder, allominati: true }])
          .then(({ error }) => {
            if (error) console.error(`Insert error for ${holder}:`, error);
          });
      }

      // 4. Re-check the connected wallet in Supabase.
      const { data: refreshedData } = await supabase
        .from('pools_members')
        .select('allominati')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle();

      if (refreshedData && refreshedData.allominati === true) {
        setUserBalanceFound(true);
      } else {
        alert("your wallet does not hold the Allominati NFT");
      }
    } catch (err) {
      console.error("Error in checkNFTStatus:", err);
    }
  };

  // Effect to handle token gating and animation state
  useEffect(() => {
    if (!TOKEN_GATED) return;

    if (isChecking) {
      // Still checking token status - stay on Gate1
      if (currentAnimationIndex !== 0) {
        setCurrentAnimationIndex(0);
        setAnimationData(animations[0]);
      }
      return;
    }

    if (isVerified) {
      // Token verified - move to Gate2
      if (currentAnimationIndex < 1) {
        setCurrentAnimationIndex(1);
        setAnimationData(animations[1]);
      }
    } else {
      // Token not verified - stay on Gate1
      if (currentAnimationIndex !== 0) {
        setCurrentAnimationIndex(0);
        setAnimationData(animations[0]);
      }
    }
  }, [TOKEN_GATED, isChecking, isVerified, currentAnimationIndex]);

  // --- Existing useEffect: Animation and smart contract data fetch ---
  useEffect(() => {
    if (!animationPlayed) {
      setAnimationData(animations[currentAnimationIndex]);
      setAnimationPlayed(true);
      setShowButtons(true);
      setLoading(true);
      
      // IMPORTANT SECTION, PLACING HERE TO EASIY FIND
      // Fetch data from smart contract to get top 10 members
      const fetchData = async () => {
        if (userBalanceFound || fetchDataExecuted.current) {
          console.log('User balance already found or fetchData already executed, skipping fetchData');
          return;
        }
        fetchDataExecuted.current = true;

        try {
          // Add a delay before making network requests
          await delay(500); // 500ms delay before fetching holders
          const holders = await contract.getHolderListWithBalance();

          if (holders.length === 0) {
            setError('No holders found.');
            setLoading(false);
            return;
          }

          // Convert holders to the expected format
          const results = holders.map((holder: { holder: string; balance: ethers.BigNumber }) => {
            const normalizedAddress = holder.holder.toLowerCase();
            return {
              address: normalizedAddress,
              balance: Math.ceil(parseFloat(ethers.utils.formatUnits(holder.balance, 6)) * 10) // MULTIPLIED BY 10 AND ROUNDED UP
            };
          });

          setBalances(results);

          await delay(500); // 500ms delay before fetching community pool balance
          const poolBalance = await fetchCommunityPoolBalance();
          setCommunityPoolBalance(poolBalance);
          console.log('Community Pool Balance:', poolBalance);

          const top10Results = results
            .filter((item: { balance: number | string }) => typeof item.balance === 'number')
            .sort((a: { balance: number }, b: { balance: number }) => b.balance - a.balance)
            .slice(0, 10);

          setTop10(top10Results);

          // Compute and set the top 10 users' information directly from holders
          let top10UserInfosArray: { place: string; userInfo: string; balanceInfo: string }[] = [];

          const sortedHolders = results
            .filter((item: { balance: number | string }) => typeof item.balance === 'number')
            .sort((a: { balance: number }, b: { balance: number }) => b.balance - a.balance)
            .slice(0, 10);

          for (let i = 0; i < sortedHolders.length; i++) {
            const place = `${i + 1}${getOrdinalSuffix(i + 1)} place`;
            const userInfo = await fetchUserInfo(sortedHolders[i].address);
            const balanceInfo =
              typeof sortedHolders[i]?.balance === 'number' ? sortedHolders[i].balance.toString() : 'N/A';

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

  // --- Existing helper function to get ordinal suffix ---
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

  // --- New autoNext function for automatic transitions ---
  const autoNext = () => {
    if (currentAnimationIndex === 1 && isVerified) {
      // Gate2 finished, advance to Animation1 (index 2)
      setCurrentAnimationIndex(2);
      setAnimationData(animations[2]);
    } else if (currentAnimationIndex >= 2) {
      // For normal animations: if at last, jump to Animation1 (index 2); otherwise, next animation.
      const nextIndex = currentAnimationIndex === animations.length - 1 ? 2 : currentAnimationIndex + 1;
      setCurrentAnimationIndex(nextIndex);
      setAnimationData(animations[nextIndex]);
    }
  };

  // --- Modified handler for Next button (manual input) ---
  const handleNext = () => {
    // Ignore manual next if in gating section (indexes 0 and 1)
    if (currentAnimationIndex < 2) return;
    
    // If we're at the last animation, do nothing
    if (currentAnimationIndex === animations.length - 1) return;
    
    // Otherwise, move to the next animation
    const nextIndex = currentAnimationIndex + 1;
    setCurrentAnimationIndex(nextIndex);
    setAnimationData(animations[nextIndex]);
  };

  // --- Modified handler for Prev button ---
  const handlePrev = () => {
    // Only allow prev navigation if current animation index is 2 or above
    if (currentAnimationIndex < 2) return;
    
    // Find the immediate smaller number in navigationIndex
    const smallerNumbers = navigationIndex.filter(index => index < currentAnimationIndex);
    
    // If there are no smaller numbers, do nothing
    if (smallerNumbers.length === 0) return;
    
    // Get the largest of the smaller numbers (immediate previous)
    const previousIndex = Math.max(...smallerNumbers);
    
    // Set the new animation index and data
    setCurrentAnimationIndex(previousIndex);
    setAnimationData(animations[previousIndex]);
  };

  // --- Existing handlers for opening and closing drawers ---
  const handleDashboardButtonClick = () => {
    setDrawerState('primary-open');
  };

  const handleClosePrimaryDrawer = () => {
    setDrawerState('closed');
  };

  const handleOpenSecondaryDrawer = () => {
    setDrawerState('secondary-open');
  };

  const handleCloseSecondaryDrawer = () => {
    setDrawerState('primary-open');
  };

  // Add new handler for table of contents drawer
  const handleTableOfContentsClick = () => {
    // Only allow table of contents to open if in main content section (index 2 or above)
    if (currentAnimationIndex < 2) return;
    setDrawerState('table-of-contents-open');
  };

  const handleCloseTableOfContentsDrawer = () => {
    setDrawerState('closed');
  };

  // --- New function to fetch the user's balance independently ---
  const fetchUserBalance = async () => {
    if (!address || userBalanceFound) {
      console.log('Address not available or user balance already found, skipping fetch');
      return;
    }

    try {
      const holders = await contract.getHolderListWithBalance();

      const results = holders.map((holder: { holder: string; balance: ethers.BigNumber }) => {
        const normalizedAddress = holder.holder.toLowerCase();
        return {
          address: normalizedAddress,
          balance: Math.ceil(parseFloat(ethers.utils.formatUnits(holder.balance, 6)) * 10) // MULTIPLIED BY 10 AND ROUNDED UP
        };
      });

      const normalizedConnectedAddress = address.toLowerCase();

      const userBalanceObj = results.find(
        (item: { address: string }) => item.address === normalizedConnectedAddress
      );
      const fetchedUserBalance = userBalanceObj ? userBalanceObj.balance : null;
      setUserBalance(fetchedUserBalance);

      if (fetchedUserBalance !== null) {
        setUserBalanceFound(true);
      }
    } catch (err) {
      console.error('Error fetching user balance:', err);
      setError('An error occurred while fetching user balance.');
    }
  };

  // Ensure address is available before fetching data
  useEffect(() => {
    if (address && !userBalanceFound) {
      fetchUserBalance();
    }
  }, [address, userBalanceFound]);

  // Add a new state variable for the donation chart drawer
  const [donationChartDrawerState, setDonationChartDrawerState] = useState<'closed' | 'open'>('closed');

  const [donationFlowDrawerState, setDonationFlowDrawerState] = useState<'closed' | 'open'>('closed');

  // Add state to track donation amount
  const [donationAmount, setDonationAmount] = useState<string>('');

  // Update the openDonationFlowDrawer function
  const openDonationFlowDrawer = (amount: string) => {
    setDonationAmount(amount);
    setDonationFlowDrawerState('open');
  };

  const handleCloseDonationFlowDrawer = () => {
    setDonationFlowDrawerState('closed');
    setDonationChartDrawerState('open');
  };

  // Add a new state variable for the vote4button
  const [vote4ButtonState, setVote4ButtonState] = useState<'closed' | 'open'>('closed');

  // Define a state and function to manage status messages
  const [status, setStatus] = useState<string>("");

  // Add handlers for each vote button
  const handleVote1ButtonClick = async () => {
    await handleVoteButtonClick('vote_button_1');
  };

  const handleVote2ButtonClick = async () => {
    await handleVoteButtonClick('vote_button_2');
  };

  const handleVote3ButtonClick = async () => {
    await handleVoteButtonClick('vote_button_3');
  };

  const handleVote4ButtonClick = async () => {
    await handleVoteButtonClick('vote_button_4');
  };

  // Generalized vote button handler
  const handleVoteButtonClick = async (buttonNumber: 'vote_button_1' | 'vote_button_2' | 'vote_button_3' | 'vote_button_4') => {
    setStatus("Preparing transaction...");
    try {
      if (!window.ethereum) {
        setStatus("MetaMask is required");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      const communityUSDCPerVote = config.community_usdc_per_vote;
      const multiplier = config[buttonNumber].multiplier;
      const recipients = config.vote_recipients_share.map((item: { address: string; share: number }) => item.address);
      const shares = config.vote_recipients_share.map((item: { address: string; share: number }) => item.share);

      const amounts = shares.map((share: number) =>
        ethers.BigNumber.from(communityUSDCPerVote)
          .mul(1000000)
          .mul(multiplier)
          .mul(share)
          .div(100)
      );

      const tags = Array(recipients.length).fill(config.tag);
      const concepts = Array(recipients.length).fill(config.concept);

      setStatus("Sending transaction...");
      const tx = await contract.assignCommunityUSDC(
        recipients,
        amounts,
        tags,
        concepts
      );
      setStatus("Transaction sent. Awaiting confirmation...");
      await tx.wait();
      setStatus("Vote assignment successful!");
      alert("Your vote has been registered on-chain.");
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  // State to store the current voting config
  const [votingConfig, setVotingConfig] = useState<any>(null);

  // Load the voting config whenever the animation index changes
  useEffect(() => {
    const fetchConfig = async () => {
      const config = await loadVotingConfig(currentAnimationIndex);
      setVotingConfig(config);
    };
    fetchConfig();
  }, [currentAnimationIndex]);

  // New state variable for the vote drawer
  const [voteDrawerState, setVoteDrawerState] = useState<'open' | 'closed'>('closed');

  const handleImproveButtonClick = () => {
    setVoteDrawerState('open');
  };

  // Add new state for audio
  const [muted, setMuted] = useState(false);
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});

  // Add a ref to track the currently playing audio
  const currentPlayingAudio = useRef<HTMLAudioElement | null>(null);

  // Add helper to (re)start narration
  const playNarration = (index: number) => {
    const configIndex = index;
    const src = narrationSources[configIndex];
    if (!src) return; // some screens may have no audio

    // Stop the currently playing audio if it exists
    if (currentPlayingAudio.current) {
      currentPlayingAudio.current.pause();
      currentPlayingAudio.current.currentTime = 0;
    }

    // Create new audio element
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = src;
    audio.muted = muted;
    
    // Store reference to this audio
    currentPlayingAudio.current = audio;
    
    // Play the new audio
    audio.load();
    audio.play().catch(() => {/* suppressed */});
  };

  // Add effect to handle audio playback
  useEffect(() => {
    if (animationPlayed) {
      playNarration(currentAnimationIndex);
    }
  }, [currentAnimationIndex, animationPlayed, muted]);

  // Add mute toggle handler
  const handleMuteToggle = () => {
    setMuted((m) => {
      Object.values(audioRefs.current).forEach(a => {
        if (a) a.muted = !m;
      });
      return !m;
    });
  };

  // Add after other state declarations
  const [animationTexts, setAnimationTexts] = useState<(string | null)[]>([]);
  const [isLoadingText, setIsLoadingText] = useState(true);

  // Add after other useEffect hooks
  useEffect(() => {
    const fetchMarkdownFiles = async () => {
      setIsLoadingText(true);
      try {
        // List of markdown file URLs with their corresponding animation numbers
        const markdownUrls = [
          {
            url: 'https://raw.githubusercontent.com/Infinite-Fountain/infinite-fountain/main/src/app/the-allo-must-flow/solving-real-customer-problems/dynamicText/animation3.md',
            animationNumber: 3
          },
          {
            url: 'https://raw.githubusercontent.com/Infinite-Fountain/infinite-fountain/main/src/app/the-allo-must-flow/solving-real-customer-problems/dynamicText/animation5.md',
            animationNumber: 5
          },
          {
            url: 'https://raw.githubusercontent.com/Infinite-Fountain/infinite-fountain/main/src/app/the-allo-must-flow/solving-real-customer-problems/dynamicText/animation6.md',
            animationNumber: 6
          },
          {
            url: 'https://raw.githubusercontent.com/Infinite-Fountain/infinite-fountain/main/src/app/the-allo-must-flow/solving-real-customer-problems/dynamicText/animation7.md',
            animationNumber: 7
          },
          {
            url: 'https://raw.githubusercontent.com/Infinite-Fountain/infinite-fountain/main/src/app/the-allo-must-flow/solving-real-customer-problems/dynamicText/animation8.md',
            animationNumber: 8
          },
          {
            url: 'https://raw.githubusercontent.com/Infinite-Fountain/infinite-fountain/main/src/app/the-allo-must-flow/solving-real-customer-problems/dynamicText/animation9.md',
            animationNumber: 9
          }
        ];
        
        // Create an array of null values matching the number of animations
        const texts = new Array(animations.length).fill(null);
        
        // Fetch each markdown file and store it at the correct index
        await Promise.all(
          markdownUrls.map(async ({ url, animationNumber }) => {
            try {
              const res = await fetch(url);
              
              if (!res.ok) {
                return null;
              }
              
              const raw = await res.text();
              
              if (raw) {
                texts[animationNumber] = DOMPurify.sanitize(marked.parse(raw, { async: false }));
              }
            } catch (err) {
              return null;
            }
            return null;
          })
        );
        setAnimationTexts(texts);
      } catch (error) {
        console.error('Error in fetchMarkdownFiles:', error);
      } finally {
        setIsLoadingText(false);
      }
    };

    fetchMarkdownFiles();
  }, []);

  // Add keyboard event listeners for arrow keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentAnimationIndex]); // Re-run effect when currentAnimationIndex changes

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
              key={currentAnimationIndex}
              animationData={animationData}
              loop={animationLoopSettings[currentAnimationIndex]}
              onComplete={autoNext}
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
          {/* Dashboard Button desktop */}
          <button
            onClick={handleDashboardButtonClick}
            className="dashboardButton"
            style={{
              position: 'absolute',
              left: '2%',
              bottom: '1%',
              width: '18%',
              height: '20%',
              backgroundColor: 'transparent',
              color: 'transparent',
              zIndex: 30,
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer'
            }}
            aria-label="Dashboard Button"
          />
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
          {/* Bottom Menu Animation rendered on top with a higher z-index and pointerEvents disabled */}
          {currentAnimationIndex >= 2 && (
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

          {/* Add a button to open the donationChartDrawer */}
          <button
            onClick={() => setDonationChartDrawerState('open')}
            className="donationChartButton"
            style={{
              position: 'absolute',
              left: '80%',
              bottom: '2%',
              width: '18%',
              height: '20%',
              backgroundColor: 'transparent',
              color: 'transparent',
              zIndex: 30,
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer'
            }}
            aria-label="Donation Chart Button"
          />

          {/* Add buttons for voting */}
          <button
            onClick={handleVote1ButtonClick}
            className="vote1button"
            style={{
              position: 'absolute',
              left: '22%',
              bottom: '2%',
              width: '13%',
              height: '17%',
              backgroundColor: 'transparent',
              color: 'black',
              zIndex: 30,
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer'
            }}
            aria-label="Vote 1 Button"
          />

          <button
            onClick={handleVote2ButtonClick}
            className="vote2button"
            style={{
              position: 'absolute',
              left: '36%',
              bottom: '2%',
              width: '13%',
              height: '17%',
              backgroundColor: 'transparent',
              color: 'black',
              zIndex: 30,
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer'
            }}
            aria-label="Vote 2 Button"
          />

          <button
            onClick={handleVote3ButtonClick}
            className="vote3button"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '2%',
              width: '13%',
              height: '17%',
              backgroundColor: 'transparent',
              color: 'black',
              zIndex: 30,
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer'
            }}
            aria-label="Vote 3 Button"
          />

          <button
            onClick={handleVote4ButtonClick}
            className="vote4button"
            style={{
              position: 'absolute',
              left: '65%',
              bottom: '2%',
              width: '13%',
              height: '17%',
              backgroundColor: 'transparent',
              color: 'black',
              zIndex: 30,
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer'
            }}
            aria-label="Vote 4 Button"
          />
        </div>

        {/* Red Container (right side) */}
        <div className="red-container">
          {/* Login Buttons */}
          <div className="flex justify-center" style={{ paddingTop: '10px' }}>
            {<LoginButton />}
          </div>
          
          {/* Dynamic Text Container ++ change the offset value against animation index in two rows*/}
          {currentAnimationIndex >= 2 && (
            <div className="flex-1 flex items-center justify-center w-full">
              {isLoadingText ? (
                <div className="text-gray-500">Loading text...</div>
              ) : (
                animationTexts[currentAnimationIndex - 1] && (
                  <div 
                    className="animation-text w-[95%] max-h-[90%] overflow-y-auto bg-transparent"
                    dangerouslySetInnerHTML={{ __html: isTranscriptOpen ? animationTexts[currentAnimationIndex -1] || '' : '' }}
                  />
                )
              )}
            </div>
          )}

          {/* Table of Contents Button */}
          {showButtons && (
            <div className="flex flex-col items-center mt-4 space-y-4">
              {/* Sound and Transcript Buttons */}
              <div className="flex w-full gap-4">
                <div className="w-1/2">
                  <MuteButton muted={muted} onToggle={handleMuteToggle} size="large" />
                </div>
                <div className="w-1/2">
                  <TranscriptButton isOpen={isTranscriptOpen} onToggle={() => setIsTranscriptOpen(!isTranscriptOpen)} size="large" />
                </div>
              </div>

              {/* Prev and Next Buttons */}
              <div className="flex justify-center">
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

              <button
                className="table-of-contents-button px-8 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition shadow-lg"
                onClick={handleTableOfContentsClick}
                aria-label="Table of Contents"
              >
                Table of Contents
              </button>
            </div>
          )}

          {votingConfig?.votingButtonVisible && (
            <Lottie
              animationData={ImproveButton as any}
              loop={true}
              style={{
                width: '40%',
                height: '40%',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: '10%',
                marginBottom: '20px',
                zIndex: 25,
              }}
              onClick={handleImproveButtonClick}
            />
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
            {<LoginButton />}
          </div>
        </div>

        {/* Yellow Container */}
        <div className="yellow-container relative">
          {/* Main Animations */}
          {animationData && (
            <Lottie
              key={currentAnimationIndex}
              animationData={animationData}
              loop={animationLoopSettings[currentAnimationIndex]}
              onComplete={autoNext}
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
          {/* Dashboard Button mobile*/}
          <button
            onClick={handleDashboardButtonClick}
            className="dashboardButton"
            style={{
              position: 'absolute',
              left: '2%',
              bottom: '1%',
              width: '18%',
              height: '20%',
              backgroundColor: 'transparent',
              color: 'transparent',
              zIndex: 30,
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer'
            }}
            aria-label="Dashboard Button"
          />
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
          {/* Bottom Menu Animation rendered on top with a higher z-index and pointerEvents disabled */}
          {currentAnimationIndex >= 2 && (
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

        {/* Blue Container */}
        <div className="blue-container relative">
          {/* Prev and Next Buttons */}
          {showButtons && (
            <div
              className="absolute top-0 right-0 z-20"
              style={{ paddingTop: '5px', paddingRight: '5px' }}
            >
              <div className="flex space-x-2">
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
                  className="next-button px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                  onClick={handleNext}
                  aria-label="Next Animation"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {/* Table of Contents Button */}
          {showButtons && (
            <div
              className="absolute top-12 right-0 z-20"
              style={{ paddingRight: '5px' }}
            >
              <button
                className="table-of-contents-button px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                onClick={handleTableOfContentsClick}
                aria-label="Table of Contents"
              >
                Table of Contents
              </button>
            </div>
          )}
          {votingConfig?.votingButtonVisible && (
            <Lottie
              animationData={ImproveButton as any}
              loop={true}
              style={{
                width: '70%',
                height: '70%',
                position: 'absolute',
                left: '20%',
                transform: 'translateX(-50%)',
                bottom: '10%',
                marginBottom: '20px',
                zIndex: 25,
              }}
              onClick={handleImproveButtonClick}
            />
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

      {/* Table of Contents Drawer */}
      <TableOfContentDrawer
        drawerState={drawerState === 'table-of-contents-open' ? 'table-of-contents-open' : 'closed'}
        handleCloseTableOfContentsDrawer={handleCloseTableOfContentsDrawer}
        onSelectSection={(index) => {
          console.log('Setting animation index to:', index);
          setCurrentAnimationIndex(index);
          setAnimationData(animations[index]);
        }}
      />

      {/* Donation Chart Drawer */}
      <DonationChartDrawer
        isOpen={donationChartDrawerState === 'open'}
        onClose={() => setDonationChartDrawerState('closed')}
        openDonationFlowDrawer={openDonationFlowDrawer}
      />

      <DonationFlowDrawer
        isOpen={donationFlowDrawerState === 'open'}
        onClose={handleCloseDonationFlowDrawer}
        donationAmount={donationAmount}
      />

      {/* Vote Drawer */}
      <VoteDrawer drawerState={voteDrawerState} handleCloseVoteDrawer={() => setVoteDrawerState('closed')} />
    </div>
  );
}
