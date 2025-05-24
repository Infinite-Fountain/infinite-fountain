// src/components/drawers/CommentDrawer.tsx

import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import CommentAnimation from '../../../../animations/comment-drawer.json';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../../firebaseClient';

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
  const [initialPrompt, setInitialPrompt] = useState("");

  // Build index document reference using currentAnimationIndex
  const indexRef = doc(
    db,
    "ideation",
    "allo-flow-greenpill-money-council",
    "indexes",
    currentAnimationIndex.toString()
  );

  // Subscribe to prompt changes
  useEffect(() => {
    const unsub = onSnapshot(indexRef, (snap) => {
      const data = snap.data() as any;
      setInitialPrompt(data?.initialPrompt ?? "");
    });
    return () => unsub();
  }, [indexRef]);

  return (
    <div className={`fixed inset-0 z-40 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${drawerState === 'open' ? 'translate-y-0' : 'translate-y-[100vh]'}`}>
      {/* Overlay */}
      <div className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${drawerState === 'open' ? 'opacity-50' : 'opacity-0 pointer-events-none'}`} onClick={handleCloseCommentDrawer}></div>

      {/* Drawer Content */}
      <div className="relative bg-transparent rounded-lg w-11/12 md:w-[600px] md:h-[600px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Background Lottie */}
        <Lottie 
          animationData={CommentAnimation} 
          loop={true} 
          className="absolute inset-0 w-full h-full" 
        />

        {/* Upper pane */}
        <div className="absolute top-[5%] left-[10%] w-[80%] h-[40%] bg-white/90 text-black p-4 rounded overflow-y-auto">
          {initialPrompt
            ? <p>{initialPrompt}</p>
            : <p className="text-gray-500">No prompt found for index {currentAnimationIndex}.</p>}
        </div>

        {/* Lower pane */}
        <div className="absolute top-[55%] left-[10%] w-[80%] h-[40%] bg-white/90 text-black p-4 rounded flex flex-col">
          {/* textarea + submit button go here */}
        </div>
      </div>
    </div>
  );
};

export default CommentDrawer;
