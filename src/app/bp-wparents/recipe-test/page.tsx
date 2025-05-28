'use client';
import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers'; // Import ethers
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import Image from 'next/image';
import abi from './abi.json'; // Import ABI from the JSON file
import '../.././global.css';
import CommentDrawer from './components/drawers/CommentDrawer';
import { auth } from '../../../firebaseClient';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import BottomMenu from './animations/bottom-menu.json'; // NEW: Import bottom-menu animation

import DashboardAnimation from './animations/dashboard.json';
import LeaderboardAnimation from './animations/leaderboard.json';

import BgStaticLottie from './animations/background.json';

import PrimarySecondaryDrawer from './components/drawers/PrimarySecondaryDrawer';

// Interface for the recipe steps

interface Step {
  id: string;
  title: string;
  videoLottie: string;
  overlayLottie: string;
  primaryDrawerLottie?: string;
  secondaryDrawerLottie?: string;
}

const steps: Step[] = [
  {
    id: 'step0',
    title: 'step0',
    videoLottie: 'step0.json',
    overlayLottie: 'step0-overlay.json',
    primaryDrawerLottie: 'step0-primarydrawer.json',
    secondaryDrawerLottie: 'step0-secondarydrawer.json',
  },
  {
    id: 'step1',
    title: 'step1',
    videoLottie: 'step1.json',
    overlayLottie: 'step1-overlay.json',
    primaryDrawerLottie: 'step1-primarydrawer.json',
    secondaryDrawerLottie: 'step1-secondarydrawer.json',
  },
  {
    id: 'step2',
    title: 'step2',
    videoLottie: 'step2.json',
    overlayLottie: 'step2-overlay.json',
    primaryDrawerLottie: 'step2-primarydrawer.json',
    secondaryDrawerLottie: 'step2-secondarydrawer.json',
  },
  {
    id: 'step3',
    title: 'step3',
    videoLottie: 'step3.json',
    overlayLottie: 'step3-overlay.json',
    primaryDrawerLottie: 'step3-primarydrawer.json',
    secondaryDrawerLottie: 'step3-secondarydrawer.json',
  },
  {
    id: 'step4',
    title: 'step4',
    videoLottie: 'step4.json',
    overlayLottie: 'step4-overlay.json',
    primaryDrawerLottie: 'step4-primarydrawer.json',
    secondaryDrawerLottie: 'step4-secondarydrawer.json',
  },
  {
    id: 'step5',
    title: 'step5',
    videoLottie: 'step5.json',
    overlayLottie: 'step5-overlay.json',
    primaryDrawerLottie: 'step5-primarydrawer.json',
    secondaryDrawerLottie: 'step5-secondarydrawer.json',
  },
  {
    id: 'step6',
    title: 'step6',
    videoLottie: 'step6.json',
    overlayLottie: 'step6-overlay.json',
    primaryDrawerLottie: 'step6-primarydrawer.json',
    secondaryDrawerLottie: 'step6-secondarydrawer.json',
  },
  {
    id: 'step7',
    title: 'step7',
    videoLottie: 'step7.json',
    overlayLottie: 'step7-overlay.json',
    primaryDrawerLottie: 'step7-primarydrawer.json',
    secondaryDrawerLottie: 'step7-secondarydrawer.json',
  },
  {
    id: 'step8',
    title: 'step8',
    videoLottie: 'step8.json',
    overlayLottie: 'step8-overlay.json',
    primaryDrawerLottie: 'step8-primarydrawer.json',
    secondaryDrawerLottie: 'step8-secondarydrawer.json',
  },
  {
    id: 'step9',
    title: 'step9',
    videoLottie: 'step9.json',
    overlayLottie: 'step9-overlay.json',
    primaryDrawerLottie: 'step9-primarydrawer.json',
    secondaryDrawerLottie: 'step9-secondarydrawer.json',
  },
  // …add objects for all steps
];

// Define constants
const ALCHEMY_API_URL = process.env.NEXT_PUBLIC_ALCHEMY_API_URL;
const CONTRACT_ADDRESS = '0xfe3Fc6cb04bA5958b0577a0c6528269964e7C8bF'; // Your contract address

// Define how many steps to expose in this recipe
const activeStepCount = 7;  // ← step 0 included, adjust per recipe

// Define which steps will have the comment drawer feature
const commentDrawerSteps = [6, 9];  // ← steps that will have comment drawer functionality

// Derive visible steps based on activeStepCount
const visibleSteps = steps.slice(0, activeStepCount);

// Define which steps have primary and secondary drawers
const stepDrawerConfig = {
  step0: { primary: false, secondary: false },
  step1: { primary: true, secondary: false },
  step2: { primary: true, secondary: false },
  step3: { primary: false, secondary: false },
  step4: { primary: false, secondary: false },
  step5: { primary: false, secondary: false },
  step6: { primary: false, secondary: false },
  step7: { primary: false, secondary: false },
  step8: { primary: false, secondary: false },
  step9: { primary: false, secondary: false },
  step10: { primary: false, secondary: false },
  // Add more steps as needed
};

export default function Page() {
  const { address } = useAccount();

  // State to manage current step
  const [currentStep, setCurrentStep] = useState<number>(0); // Default to step0

  // State to manage drawer states
  const [drawerState, setDrawerState] = useState<'closed' | 'primary' | 'secondary' | 'comment'>('closed');

  // State for comment drawer data
  const [commentDrawerData, setCommentDrawerData] = useState<{
    initialPrompt: string;
    thread: any[];
    latestSubmission?: string;
  } | null>(null);

  // Placeholders for lazy-loaded data
  const [videoData, setVideoData] = useState<any>(null);
  const [ovlData, setOvlData] = useState<any>(null);
  const [drwData, setDrwData] = useState<any>(null);

  // B-1 · State for drawer Lottie JSON
  const [primaryDrawerData, setPrimaryDrawerData] = useState<any>(null);
  const [secondaryDrawerData, setSecondaryDrawerData] = useState<any>(null);

  // Initialize ethers provider and contract
  const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  useEffect(() => {
    let canceled = false;

    // Load current step
    import(`./animations/${visibleSteps[currentStep].videoLottie}`)
      .then(m => !canceled && setVideoData(m.default));

    // Load overlay if defined
    const ovlPath = visibleSteps[currentStep].overlayLottie;
    if (ovlPath) {
      import(`./animations/${ovlPath}`)
        .then(m => !canceled && setOvlData(m.default));
    } else {
      setOvlData(null);
    }

    // Prefetch neighbors
    [currentStep - 3, currentStep - 2, currentStep - 1, currentStep + 1, currentStep + 2, currentStep + 3].forEach(i => {
      if (visibleSteps[i]) {
        import(`./animations/${visibleSteps[i].videoLottie}`);
        if (visibleSteps[i].overlayLottie) {
          import(`./animations/${visibleSteps[i].overlayLottie}`);
        }
      }
    });

    return () => {
      canceled = true;
      setVideoData(null);
      setOvlData(null);
    };
  }, [currentStep, visibleSteps]);

  // B-2 · Lazy-load drawer Lotties on open
  useEffect(() => {
    let canceled = false;

    if (drawerState === 'primary' && visibleSteps[currentStep].primaryDrawerLottie) {
      import(`./animations/${visibleSteps[currentStep].primaryDrawerLottie}`)
        .then(m => !canceled && setPrimaryDrawerData(m.default));
    } else if (drawerState === 'secondary' && visibleSteps[currentStep].secondaryDrawerLottie) {
      import(`./animations/${visibleSteps[currentStep].secondaryDrawerLottie}`)
        .then(m => !canceled && setSecondaryDrawerData(m.default));
    }

    return () => { canceled = true; };
  }, [drawerState, currentStep, visibleSteps]);

  // Add effect to preload comment drawer data
  useEffect(() => {
    if (commentDrawerSteps.includes(currentStep)) {
      // Preload the assistant-first-response data
      fetch('/bp-wparents/recipe-test/api/assistant-first-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idx: currentStep })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Assistant API error:', data.error);
          return;
        }
        // Check if we have reply in the response
        if (data.reply) {
          setCommentDrawerData({
            initialPrompt: data.reply,
            thread: [],
            latestSubmission: undefined
          });
        }
      })
      .catch(error => {
        console.error("Error preloading assistant data:", error);
      });
    } else {
      setCommentDrawerData(null);
    }
  }, [currentStep]);

  // Render background Lottie at z-index 0
  const renderBackground = () => (
    <Lottie
      animationData={BgStaticLottie}
      loop={true}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0, // Ensure background is behind other elements
      }}
    />
  );

  // Conditionally render overlay Lottie if available
  const renderOverlay = () => {
    if (visibleSteps[currentStep].overlayLottie) {
      return (
        <Lottie
          animationData={ovlData}
          loop={true}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 20, // Ensure overlay is above step1
          }}
        />
      );
    }
    return null;
  };

  // Ensure the stepDrawerConfig is accessed with a valid key
  const currentStepKey = `step${currentStep}` as keyof typeof stepDrawerConfig;

  // Function to adjust the margin-top of the green container
  function adjustGreenContainerPosition() {
    const greenContainer = document.querySelector('.green-container') as HTMLElement;
    if (!greenContainer) return;

    // Calculate the height of the viewport
    const viewportHeight = window.innerHeight;

    // Calculate the height of the document
    const documentHeight = document.documentElement.clientHeight;

    // Calculate the height of the browser's header
    const headerHeight = viewportHeight - documentHeight;

    // Set the margin-top of the green container
    greenContainer.style.marginTop = `${headerHeight}px`;
  }

  // Adjust the position on page load
  window.addEventListener('load', adjustGreenContainerPosition);

  // Adjust the position on window resize
  window.addEventListener('resize', adjustGreenContainerPosition);

  // Handler for Google login button
  async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Optionally, you can handle user info or redirect here
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  }

  // Helper to get user email prefix
  const userEmailPrefix = auth.currentUser?.email ? auth.currentUser.email.split('@')[0] : null;

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Mobile Green Container (Login/User Wallet) - in normal flow to push yellow down */}
      <div className="green-container md:hidden">
        <div className="flex justify-end items-center" style={{ padding: '5px' }}>
          {userEmailPrefix ? (
            <span style={{
              color: '#111',
              fontWeight: 500,
              fontSize: 18,
              background: '#fff',
              borderRadius: '24px',
              padding: '8px 20px',
              boxShadow: '0 1px 2px rgba(60,64,67,.15)',
              display: 'inline-block',
              minWidth: '80px',
              textAlign: 'center',
            }}>{userEmailPrefix}</span>
          ) : (
            <button
              onClick={handleGoogleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                border: 'none',
                borderRadius: '24px',
                boxShadow: '0 1px 2px rgba(60,64,67,.3)',
                padding: '0 16px',
                height: '48px',
                cursor: 'pointer',
              }}
            >
              <Image src="/signin-google.png" alt="Sign in with Google" width={160} height={48} />
            </button>
          )}
        </div>
      </div>

      {/* Single Lottie Container (Yellow Container) for Mobile */}
      <div className="yellow-container relative block md:hidden">
        {/* Lottie Animation for Mobile */}
        <Lottie
          animationData={videoData}
          loop={true}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
          }}
        />

        {/* Background Lottie Animation for Mobile */}
        {renderBackground()}

        {/* Overlay Lottie Animation for Mobile */}
        {renderOverlay()}

        {/* Conditionally render each hard-coded button for mobile */}
        {activeStepCount > 1 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(1); }}
            className="recipe-steps-button"
            style={{ left: '3.5%', bottom: '32.5%' }}
            aria-label="Go to Step 1"
          />
        )}
        {activeStepCount > 2 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(2); }}
            className="recipe-steps-button"
            style={{ left: '33.5%', bottom: '32.5%' }}
            aria-label="Go to Step 2"
          />
        )}
        {activeStepCount > 3 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(3); }}
            className="recipe-steps-button"
            style={{ left: '63.5%', bottom: '32.5%' }}
            aria-label="Go to Step 3"
          />
        )}
        {activeStepCount > 4 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(4); }}
            className="recipe-steps-button"
            style={{ left: '71%', bottom: '18.5%' }}
            aria-label="Go to Step 4"
          />
        )}
        {activeStepCount > 5 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(5); }}
            className="recipe-steps-button"
            style={{ left: '41%', bottom: '18.5%' }}
            aria-label="Go to Step 5"
          />
        )}
        {activeStepCount > 6 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(6); }}
            className="recipe-steps-button"
            style={{ left: '11%', bottom: '18.5%' }}
            aria-label="Go to Step 6"
          />
        )}
        {activeStepCount > 7 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(7); }}
            className="recipe-steps-button"
            style={{ left: '3.5%', bottom: '4%' }}
            aria-label="Go to Step 7"
          />
        )}
        {activeStepCount > 8 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(8); }}
            className="recipe-steps-button"
            style={{ left: '33.5%', bottom: '4%' }}
            aria-label="Go to Step 8"
          />
        )}
        {activeStepCount > 9 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(9); }}
            className="recipe-steps-button"
            style={{ left: '63.5%', bottom: '4%' }}
            aria-label="Go to Step 9"
          />
        )}

        {/* drawer button for mobile */}
        {stepDrawerConfig[currentStepKey].primary && (
          <button
            onClick={() => setDrawerState('primary')}
            style={{
              backgroundColor: 'transparent',
              width: '25%',
              height: '12%',
              position: 'absolute',
              left: '73%',
              bottom: '85%',
              zIndex: 30, // Ensure button is above overlay
            }}
            aria-label="Open Primary Drawer"
          />
        )}
        {/* Comment drawer button for mobile */}
        {commentDrawerSteps.includes(currentStep) && (
          <button
            onClick={() => {
              if (!auth.currentUser) {
                alert('please login first');
                return;
              }
              setDrawerState('comment');
            }}
            style={{
              backgroundColor: 'transparent',
              width: '25%',
              height: '12%',
              position: 'absolute',
              left: '73%',
              bottom: '85%',
              zIndex: 30, // Ensure button is above overlay
            }}
            aria-label="Open Comment Drawer"
          />
        )}
      </div>

      {/* Single Lottie Container (Yellow Container) for Desktop */}
      <div className="yellow-container relative hidden md:block">
        {/* Lottie Animation for Desktop */}
        <Lottie
          animationData={videoData}
          loop={true}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 10,
          }}
        />

        {/* Background Lottie Animation for Desktop */}
        {renderBackground()}

        {/* Overlay Lottie Animation for Desktop */}
        {renderOverlay()}

        {/* Conditionally render each hard-coded button for desktop */}
        {activeStepCount > 1 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(1); }}
            className="recipe-steps-button"
            style={{ left: '3.5%', bottom: '32.5%' }}
            aria-label="Go to Step 1"
          />
        )}
        {activeStepCount > 2 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(2); }}
            className="recipe-steps-button"
            style={{ left: '33.5%', bottom: '32.5%' }}
            aria-label="Go to Step 2"
          />
        )}
        {activeStepCount > 3 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(3); }}
            className="recipe-steps-button"
            style={{ left: '63.5%', bottom: '32.5%' }}
            aria-label="Go to Step 3"
          />
        )}
        {activeStepCount > 4 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(4); }}
            className="recipe-steps-button"
            style={{ left: '71%', bottom: '18.5%' }}
            aria-label="Go to Step 4"
          />
        )}
        {activeStepCount > 5 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(5); }}
            className="recipe-steps-button"
            style={{ left: '41%', bottom: '18.5%' }}
            aria-label="Go to Step 5"
          />
        )}
        {activeStepCount > 6 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(6); }}
            className="recipe-steps-button"
            style={{ left: '11%', bottom: '18.5%' }}
            aria-label="Go to Step 6"
          />
        )}
        {activeStepCount > 7 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(7); }}
            className="recipe-steps-button"
            style={{ left: '3.5%', bottom: '4%' }}
            aria-label="Go to Step 7"
          />
        )}
        {activeStepCount > 8 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(8); }}
            className="recipe-steps-button"
            style={{ left: '33.5%', bottom: '4%' }}
            aria-label="Go to Step 8"
          />
        )}
        {activeStepCount > 9 && (
          <button
            onClick={() => { setDrawerState('closed'); setCurrentStep(9); }}
            className="recipe-steps-button"
            style={{ left: '63.5%', bottom: '4%' }}
            aria-label="Go to Step 9"
          />
        )}

        {/* drawer button for desktop */}
        {stepDrawerConfig[currentStepKey].primary && (
          <button
            onClick={() => setDrawerState('primary')}
            style={{
              backgroundColor: 'transparent',
              width: '25%',
              height: '12%',
              position: 'absolute',
              left: '73%',
              bottom: '85%',
              zIndex: 30, // Ensure button is above overlay
            }}
            aria-label="Open Primary Drawer"
          />
        )}
        {/* Comment drawer button for desktop */}
        {commentDrawerSteps.includes(currentStep) && (
          <button
            onClick={() => {
              if (!auth.currentUser) {
                alert('please login first');
                return;
              }
              setDrawerState('comment');
            }}
            style={{
              backgroundColor: 'transparent',
              width: '25%',
              height: '12%',
              position: 'absolute',
              left: '73%',
              bottom: '85%',
              zIndex: 30, // Ensure button is above overlay
            }}
            aria-label="Open Comment Drawer"
          />
        )}
      </div>

      {/* Desktop Red Container (Login/User Wallet) - in normal flow to push yellow down */}
      <div className="red-container hidden md:flex justify-end items-center" style={{ padding: '5px' }}>
        {userEmailPrefix ? (
          <span style={{
            color: '#111',
            fontWeight: 500,
            fontSize: 18,
            background: '#fff',
            borderRadius: '24px',
            padding: '8px 20px',
            boxShadow: '0 1px 2px rgba(60,64,67,.15)',
            display: 'inline-block',
            minWidth: '80px',
            textAlign: 'center',
          }}>{userEmailPrefix}</span>
        ) : (
          <button
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#fff',
              border: 'none',
              borderRadius: '24px',
              boxShadow: '0 1px 2px rgba(60,64,67,.3)',
              padding: '0 16px',
              height: '48px',
              cursor: 'pointer',
            }}
          >
            <Image src="/signin-google.png" alt="Sign in with Google" width={160} height={48} />
          </button>
        )}
      </div>

      {/* B-3 · Pass data into the drawer component */}
      <PrimarySecondaryDrawer
        drawerState={
          drawerState === 'primary' ? 'primary-open' :
          drawerState === 'secondary' ? 'secondary-open' :
          drawerState === 'comment' ? 'comment-open' : 'closed'
        }
        handleClosePrimaryDrawer={() => setDrawerState('closed')}
        handleCloseSecondaryDrawer={() => setDrawerState('closed')}
        handleCloseCommentDrawer={() => setDrawerState('closed')}
        primaryAnimationData={primaryDrawerData}
        secondaryAnimationData={secondaryDrawerData}
        loading={false}
        communityPoolBalance={'--'}
        userBalance={null}
        top10={[]}
        top10UserInfos={[]}
        calculateCompletionPercentage={() => '0%'}
      />

      {/* Comment Drawer */}
      <CommentDrawer
        drawerState={drawerState === 'comment' ? 'open' : 'closed'}
        handleCloseCommentDrawer={() => setDrawerState('closed')}
        currentAnimationIndex={currentStep}
        preloadedData={commentDrawerData}
      />
    </div>
  );
}
