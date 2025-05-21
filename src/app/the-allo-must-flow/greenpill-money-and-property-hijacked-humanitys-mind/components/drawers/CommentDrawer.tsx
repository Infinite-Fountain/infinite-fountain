// src/components/drawers/CommentDrawer.tsx

import React from 'react';
import Lottie from 'lottie-react';
import VoteAnimation from '../../animations/vote-1-5-10.json';

interface CommentDrawerProps {
  drawerState: 'open' | 'closed';
  handleCloseCommentDrawer: () => void;
}

const CommentDrawer: React.FC<CommentDrawerProps> = ({ drawerState, handleCloseCommentDrawer }) => {
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

        {/* Drawer Container */}
        <div className="drawer-container w-full h-full relative">
          {/* Vote Lottie Animation */}
          <Lottie animationData={VoteAnimation} loop={true} className="absolute inset-0 w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default CommentDrawer;
