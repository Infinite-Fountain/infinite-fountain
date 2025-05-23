// src/components/drawers/CommentDrawer.tsx

import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import VoteAnimation from '../../animations/vote-1-5-10.json';

interface CommentDrawerProps {
  drawerState: 'open' | 'closed';
  handleCloseCommentDrawer: () => void;
  currentAnimationIndex: number;
}

const CommentDrawer: React.FC<CommentDrawerProps> = ({ 
  drawerState, 
  handleCloseCommentDrawer,
  currentAnimationIndex 
}) => {
  const [commentPrompt, setCommentPrompt] = useState<string>('Share your thoughts');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await import(`../../configs/Index${currentAnimationIndex}voting.json`);
        const prompt = config.default?.commentPrompt || 'Share your thoughts';
        setCommentPrompt(prompt);
      } catch (error) {
        console.error('Error loading comment prompt:', error);
      }
    };

    if (drawerState === 'open') {
      fetchConfig();
    }
  }, [drawerState, currentAnimationIndex]);

  return (
    <div className={`fixed inset-0 z-40 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${drawerState === 'open' ? 'translate-y-0' : 'translate-y-[100vh]'}`}>
      {/* Overlay */}
      <div className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${drawerState === 'open' ? 'opacity-50' : 'opacity-0 pointer-events-none'}`} onClick={handleCloseCommentDrawer}></div>

      {/* Drawer Content */}
      <div className="relative bg-black rounded-t-lg overflow-hidden transform transition-transform duration-300 ease-in-out w-11/12 md:w-auto md:h-4/5 aspect-square md:aspect-square" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-white text-xl focus:outline-none focus:ring-2 focus:ring-white rounded"
          onClick={handleCloseCommentDrawer}
          aria-label="Close Comment Drawer"
        >
          &times;
        </button>

        {/* Header with Comment Prompt */}
        <div className="absolute top-0 left-0 right-0 bg-gray-900 p-6 text-center z-50">
          <h2 className="text-white text-2xl md:text-3xl font-semibold relative z-50 leading-relaxed">
            {commentPrompt}
          </h2>
        </div>

        {/* Drawer Container */}
        <div className="drawer-container w-full h-full relative pt-24"> {/* Increased padding-top to account for larger header */}
          {/* Vote Lottie Animation */}
          <Lottie animationData={VoteAnimation} loop={true} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />
        </div>
      </div>
    </div>
  );
};

export default CommentDrawer;
