// src/components/drawers/CommentDrawer.tsx

import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import CommentAnimation from '../../../../animations/comment-drawer.json';
import {
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { db, auth } from '../../../../../firebaseClient';

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
  const [thread, setThread] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevThreadLengthRef = useRef(0);

  // Build index document reference using currentAnimationIndex
  const indexRef = doc(
    db,
    "ideation",
    "allo-flow-greenpill-money-council",
    "indexes",
    currentAnimationIndex.toString()
  );

  // Build message document reference
  const msgRef = auth.currentUser
    ? doc(
        db,
        "ideation",
        "allo-flow-greenpill-money-council",
        "indexes",
        currentAnimationIndex.toString(),
        "messages",
        auth.currentUser.uid
      )
    : null;

  // Subscribe to prompt changes
  useEffect(() => {
    const unsub = onSnapshot(indexRef, (snap) => {
      const data = snap.data() as any;
      setInitialPrompt(data?.initialPrompt ?? "");
    });
    return () => unsub();
  }, [indexRef]);

  // Subscribe to thread changes
  useEffect(() => {
    if (!msgRef) {
      setIsLoadingThread(false);
      return;
    }

    setIsLoadingThread(true);
    const unsub = onSnapshot(msgRef, (snap) => {
      const data = snap.data() as any;
      setThread(data?.thread ?? []);
      setIsLoadingThread(false);
    }, (error) => {
      console.error("Error loading thread:", error);
      setIsLoadingThread(false);
    });

    return () => unsub();
  }, [msgRef]);

  // Auto-scroll only when new content arrives
  useEffect(() => {
    if (!scrollRef.current) return;
    
    // Only scroll if thread length has increased
    if (thread.length > prevThreadLengthRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    
    // Update the ref with current length
    prevThreadLengthRef.current = thread.length;
  }, [thread.length]);

  // Auto-trigger followups based on thread state
  useEffect(() => {
    if (!msgRef) return;
    
    const userCount = thread.filter(m => m.role === 'user').length;
    const assistantCount = thread.filter(m => m.role === 'assistant').length;

    // Don't trigger if we're already thinking or if we have enough assistant messages
    if (isThinking || assistantCount >= 2) return;

    let next: { role: string; text: string; ts: number } | null = null;
    if (userCount >= 1 && assistantCount === 0) {
      next = simulatedResponses.followup1;
    } else if (userCount >= 2 && assistantCount === 1) {
      next = simulatedResponses.followup2;
    }

    if (next) {
      setIsThinking(true);
      setTimeout(async () => {
        try {
          await updateDoc(msgRef!, { 
            thread: arrayUnion(next!),
            lastUpdated: serverTimestamp()
          });
        } catch (error) {
          console.error("Error adding followup:", error);
        } finally {
          setIsThinking(false);
        }
      }, 2000);
    }
  }, [thread, msgRef, isThinking]);

  // Simulating chatgpt for now (remove this later or replace with actual chatgpt)
  const simulatedResponses = {
    followup1: {
      role: "assistant",
      text: "This is a simulated ChatGPT response 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
      ts: Date.now()
    },
    followup2: {
      role: "assistant",
      text: "This is a simulated ChatGPT response 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
      ts: Date.now()
    },
    followup3: {
      role: "assistant",
      text: "Bellow is your final response and it is already saved. You can edit it by clicking the 'Edit' button.",
      ts: Date.now()
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser || !input.trim()) return;
    setSubmitting(true);

    try {
      // Append user message
      await updateDoc(msgRef!, {
        thread: arrayUnion({
          role: "user",
          text: input.trim(),
          ts: Date.now(),
        }),
        lastUpdated: serverTimestamp()
      }).catch(async (err) => {
        // If doc didn't exist yet, create it with the first thread entry
        if (err.code === "not-found") {
          await setDoc(msgRef!, {
            thread: [
              { role: "user", text: input.trim(), ts: Date.now() }
            ],
            lastUpdated: serverTimestamp()
          });
        } else {
          throw err;
        }
      });

      setInput("");
    } catch (error) {
      console.error("Error submitting message:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // TODO: Implement edit functionality
  };

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
        <div
          className="absolute top-[5%] left-[10%] w-[80%] h-[40%] bg-white/90 text-black p-4 rounded overflow-y-auto"
          ref={scrollRef}
        >
          {initialPrompt && <p className="mb-4">{initialPrompt}</p>}
          {isLoadingThread ? (
            <div className="text-gray-500">Loading conversation...</div>
          ) : (
            <>
              {thread.map((msg, i) => (
                <div key={i} className="mb-2">
                  <strong>{msg.role}:</strong> {msg.text}
                </div>
              ))}
              {isThinking && (
                <div className="mb-2 text-gray-500 animate-pulse">
                  thinking...
                </div>
              )}
            </>
          )}
        </div>

        {/* Lower pane */}
        <div className="absolute top-[48%] left-[10%] w-[80%] h-[40%] bg-white/90 text-black p-4 rounded flex flex-col">
          <textarea
            className="flex-1 w-full p-2 border rounded resize-none"
            placeholder="Type your response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-between mt-2">
            <button
              className="px-4 py-2 border rounded disabled:opacity-50"
              onClick={handleSubmit}
              disabled={!input.trim() || submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
            {thread.filter(m => m.role === 'assistant').length >= 2 && (
              <button
                className="px-4 py-2 border rounded"
                onClick={handleEdit}
              >
                Edit Final
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentDrawer;
