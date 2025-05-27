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
  arrayUnion,
  DocumentReference
} from 'firebase/firestore';
import { db, auth } from '../../../../../firebaseClient';

// Add new hook for preloading comments
export const usePreloadComments = (currentAnimationIndex: number, votingConfig: any) => {
  const [preloadedData, setPreloadedData] = useState<{
    initialPrompt: string;
    thread: any[];
    latestSubmission?: string;
  } | null>(null);

  useEffect(() => {
    if (!votingConfig?.votingButtonVisible) {
      setPreloadedData(null);
      return;
    }

    const indexRef = doc(
      db,
      "ideation",
      "allo-flow-greenpill-money-council",
      "indexes",
      currentAnimationIndex.toString()
    );

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
    const unsubPrompt = onSnapshot(indexRef, (snap) => {
      const data = snap.data() as any;
      setPreloadedData(prev => ({
        initialPrompt: data?.initialPrompt ?? "",
        thread: prev?.thread ?? [],
        latestSubmission: prev?.latestSubmission
      }));
    });

    // Subscribe to thread changes if user is logged in
    let unsubThread = () => {};
    if (msgRef) {
      unsubThread = onSnapshot(msgRef, (snap) => {
        const data = snap.data() as any;
        setPreloadedData(prev => ({
          initialPrompt: prev?.initialPrompt ?? "",
          thread: data?.thread ?? [],
          latestSubmission: data?.latestSubmission
        }));
      });
    }

    return () => {
      unsubPrompt();
      unsubThread();
    };
  }, [currentAnimationIndex, votingConfig?.votingButtonVisible]);

  return preloadedData;
};

// Helper function for adding submission versions
const addSubmissionVersion = async (
  msgRef: DocumentReference,
  text: string
) => {
  const tsKey = new Date().toISOString();
  await updateDoc(msgRef, {
    [`submissionVersions.${tsKey}`]: text, // dot-notation merge
    latestSubmission: text,
    lastUpdated: serverTimestamp(),
  });
};

interface CommentDrawerProps {
  drawerState: 'open' | 'closed';
  handleCloseCommentDrawer: () => void;
  currentAnimationIndex: number;
  preloadedData: {
    initialPrompt: string;
    thread: any[];
    latestSubmission?: string;
  } | null;
}

const CommentDrawer: React.FC<CommentDrawerProps> = ({ 
  drawerState, 
  handleCloseCommentDrawer,
  currentAnimationIndex,
  preloadedData
}) => {
  const [initialPrompt, setInitialPrompt] = useState("");
  const [thread, setThread] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubmission, setEditedSubmission] = useState("");
  const upperScrollRef = useRef<HTMLDivElement>(null);
  const lowerScrollRef = useRef<HTMLDivElement>(null);
  const prevThreadLengthRef = useRef(0);

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

  // Use preloaded data when available
  useEffect(() => {
    if (preloadedData) {
      setInitialPrompt(preloadedData.initialPrompt);
      setThread(preloadedData.thread);
      setIsLoadingThread(false);

      // Use latestSubmission if available, otherwise construct from user messages
      if (preloadedData.latestSubmission && !isEditing) {
        setEditedSubmission(preloadedData.latestSubmission);
      } else if (!isEditing) {
        const userMessages = preloadedData.thread.filter((m: any) => m.role === 'user');
        if (userMessages.length > 0) {
          setEditedSubmission(userMessages.map((m: any) => m.text).join('\n\n'));
        }
      }
    }
  }, [preloadedData, isEditing]);

  // Auto-scroll only when new content arrives in the upper pane
  useEffect(() => {
    if (!upperScrollRef.current || isEditing) return;
    
    // Only scroll if thread length has actually increased
    if (thread.length > prevThreadLengthRef.current) {
      upperScrollRef.current.scrollTo({
        top: upperScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    
    // Update stored length for next comparison
    prevThreadLengthRef.current = thread.length;
  }, [thread.length, isEditing]);

  // Auto-trigger followups based on thread state
  useEffect(() => {
    if (!msgRef) return;
    
    const userCount = thread.filter(m => m.role === 'user').length;
    const assistantCount = thread.filter(m => m.role === 'assistant').length;

    // Don't trigger if we're already thinking or if we have enough assistant messages
    if (isThinking || assistantCount >= 2) return;

    let next: { role: string; text: string; ts: number } | null = null;
    
    // For first user message, use our assistant-first-response API
    if (userCount === 1 && assistantCount === 0) {
      setIsThinking(true);
      const userMessage = thread.find(m => m.role === 'user');
      if (userMessage) {
        fetch('/the-allo-must-flow/greenpill-money-cordyceps-wisdom-council/api/assistant-first-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: userMessage.text,
            initialPrompt: initialPrompt,
            idx: currentAnimationIndex
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('Assistant API error:', data.error);
            return;
          }
          return updateDoc(msgRef!, {
            thread: arrayUnion({
              role: "assistant",
              text: data.reply,
              ts: Date.now()
            }),
            lastUpdated: serverTimestamp()
          });
        })
        .catch(error => {
          console.error("Error calling assistant API:", error);
        })
        .finally(() => {
          setIsThinking(false);
        });
      }
      return;
    }
    
    // For subsequent messages, use simulated responses
    if (userCount >= 2 && assistantCount === 1) {
      setIsThinking(true);
      fetch('/the-allo-must-flow/greenpill-money-cordyceps-wisdom-council/api/assistant-second-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          thread: thread,
          initialPrompt: initialPrompt,
          idx: currentAnimationIndex
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Assistant API error:', data.error);
          return;
        }
        return updateDoc(msgRef!, {
          thread: arrayUnion({
            role: "assistant",
            text: data.reply,
            ts: Date.now()
          }),
          lastUpdated: serverTimestamp()
        });
      })
      .then(() => {
        // Check if this was the third user message and handle final submission
        if (userCount >= 3 && assistantCount === 1) {
          const userMessages = thread.filter(m => m.role === 'user');
          const finalSubmission = userMessages.map(m => m.text).join('\n\n');
          return updateDoc(msgRef!, {
            finalSubmission: finalSubmission,
            lastUpdated: serverTimestamp()
          });
        }
      })
      .catch(error => {
        console.error("Error calling assistant API:", error);
      })
      .finally(() => {
        setIsThinking(false);
      });
      return;
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
      // Check if this is the third user message
      const userCount = thread.filter(m => m.role === 'user').length;
      const isThirdMessage = userCount === 2; // 0-based index, so 2 means third message

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

      // If this was the third message, send the final submission
      if (isThirdMessage) {
        const userMessages = [...thread.filter(m => m.role === 'user'), { role: "user", text: input.trim(), ts: Date.now() }];
        const finalSubmission = userMessages.map(m => m.text).join('\n\n');
        await addSubmissionVersion(msgRef!, finalSubmission);
      }

      setInput("");
    } catch (error) {
      console.error("Error submitting message:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!msgRef) return;
    setSubmitting(true);
    try {
      await addSubmissionVersion(msgRef, editedSubmission);
      setIsEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Get the final submission by combining all user messages
  const getFinalSubmission = () => {
    const userMessages = thread.filter(m => m.role === 'user');
    return userMessages.map(m => m.text).join('\n\n');
  };

  // Check if we're in final state (3 user messages and 2 assistant messages)
  const isFinalState = thread.filter(m => m.role === 'user').length >= 3 && 
                      thread.filter(m => m.role === 'assistant').length >= 2;

  // Get the display thread that includes followup3 in the UI but not in Firebase
  const getDisplayThread = () => {
    const userCount = thread.filter(m => m.role === 'user').length;
    const assistantCount = thread.filter(m => m.role === 'assistant').length;
    
    if (userCount >= 3 && assistantCount === 2) {
      return [...thread, simulatedResponses.followup3];
    }
    return thread;
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
          ref={upperScrollRef}
        >
          {initialPrompt && <p className="mb-4">{initialPrompt}</p>}
          {isLoadingThread ? (
            <div className="text-gray-500">Loading conversation...</div>
          ) : (
            <>
              {getDisplayThread().map((msg, i) => (
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
          {!isFinalState ? (
            <>
              <textarea
                className="flex-1 w-full p-2 border rounded resize-none"
                placeholder="Type your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={submitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  className="px-4 py-2 border rounded disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={!input.trim() || submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 w-full p-4 overflow-y-auto" ref={lowerScrollRef}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Your Final Submission:</h3>
                <button
                  className="px-4 py-2 border rounded"
                  onClick={isEditing ? handleSaveEdit : handleEdit}
                >
                  {isEditing ? "Save Edit" : "Edit Final"}
                </button>
              </div>
              {isEditing ? (
                <textarea
                  className="w-full h-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedSubmission}
                  onChange={(e) => setEditedSubmission(e.target.value)}
                  autoFocus
                />
              ) : (
                <div className="whitespace-pre-wrap">
                  {editedSubmission}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentDrawer;
