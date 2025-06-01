// src/components/drawers/CommentDrawer.tsx

import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import CommentAnimation from '../../animations/background.json';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
export const usePreloadComments = (currentAnimationIndex: number) => {
  const [preloadedData, setPreloadedData] = useState<{
    initialPrompt: string;
    thread: any[];
  } | null>(null);

  useEffect(() => {
    const indexRef = doc(
      db,
      "ideation",
      "koz-recipe-assistant",
      "indexes",
      currentAnimationIndex.toString()
    );

    const msgRef = auth.currentUser
      ? doc(
          db,
          "ideation",
          "koz-recipe-assistant",
          "indexes",
          currentAnimationIndex.toString(),
          "messages",
          auth.currentUser.uid
        )
      : null;

    let isSubscribed = true;
    let unsubscribeFunctions: (() => void)[] = [];
    let updateTimeout: NodeJS.Timeout;

    // Subscribe to prompt changes
    const unsubPrompt = onSnapshot(indexRef, (snap) => {
      if (!isSubscribed) return;
      
      const data = snap.data() as any;
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        if (isSubscribed) {
          setPreloadedData(prev => ({
            initialPrompt: data?.initialPrompt ?? "",
            thread: prev?.thread ?? []
          }));
        }
      }, 100);
    }, (error) => {
      // Silently handle any Firebase errors
      if (error.code === 'permission-denied') {
        // Handle permission errors if needed
      }
    });

    unsubscribeFunctions.push(unsubPrompt);

    // Subscribe to thread changes if user is logged in
    if (msgRef) {
      const unsubThread = onSnapshot(msgRef, (snap) => {
        if (!isSubscribed) return;
        
        const data = snap.data() as any;
        if (data?.thread) {
          // Sort thread by timestamp to ensure correct order
          const sortedThread = [...data.thread].sort((a, b) => a.ts - b.ts);
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(() => {
            if (isSubscribed) {
              setPreloadedData(prev => ({
                initialPrompt: prev?.initialPrompt ?? "",
                thread: sortedThread
              }));
            }
          }, 100);
        } else {
          clearTimeout(updateTimeout);
          updateTimeout = setTimeout(() => {
            if (isSubscribed) {
              setPreloadedData(prev => ({
                initialPrompt: prev?.initialPrompt ?? "",
                thread: []
              }));
            }
          }, 100);
        }
      }, (error) => {
        // Silently handle any Firebase errors
        if (error.code === 'permission-denied') {
          // Handle permission errors if needed
        }
      });

      unsubscribeFunctions.push(unsubThread);
    }

    return () => {
      isSubscribed = false;
      clearTimeout(updateTimeout);
      
      // Use a more graceful cleanup approach
      const cleanup = () => {
        unsubscribeFunctions.forEach(unsub => {
          try {
            unsub();
          } catch (error) {
            // Ignore unsubscribe errors
          }
        });
        unsubscribeFunctions = [];
      };

      // Try to cleanup immediately, but don't worry if it fails
      try {
        cleanup();
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, [currentAnimationIndex]);

  return preloadedData;
};

// Helper function for adding submission versions
const addSubmissionVersion: (msgRef: DocumentReference, text: string) => Promise<void> = async (
  msgRef: DocumentReference,
  text: string
) => {
  const tsKey = new Date().toISOString();
  await updateDoc(msgRef, {
    [`submissionVersions.${tsKey}`]: text,
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
  } | null;
}

// Add thinking messages mapping with durations
type ThinkingMessage = { message: string; duration: number };
type ThinkingMessages = {
  [key: number]: ThinkingMessage[];
  default: ThinkingMessage[];
};

const THINKING_MESSAGES: ThinkingMessages = {
  6: [
    { message: "Analyzing your preferences...", duration: 8000 },
    { message: "Searching the database...", duration: 8000 },
    { message: "Preparing your personalized recommendations...", duration: 0 } // 0 means stay until response
  ],
  // Add other indices here with their specific messages and durations
  default: [
    { message: "Thinking...", duration: 3000 },
    { message: "Processing...", duration: 3000 },
    { message: "Preparing answer...", duration: 0 }
  ]
};

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
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const upperScrollRef = useRef<HTMLDivElement>(null);
  const lowerScrollRef = useRef<HTMLDivElement>(null);
  const [thinkingMessageIndex, setThinkingMessageIndex] = useState(0);
  const thinkingTimerRef = useRef<NodeJS.Timeout>();

  // Track previous thread length for auto-scroll
  const prevThreadLengthRef = useRef(0);

  // Build message document reference
  const msgRef = auth.currentUser
    ? doc(
        db,
        "ideation",
        "koz-recipe-assistant",
        "indexes",
        currentAnimationIndex.toString(),
        "messages",
        auth.currentUser.uid
      )
    : null;

  // Subscribe to Firebase updates
  useEffect(() => {
    if (!msgRef) return;
    
    let isSubscribed = true;
    let unsubscribeFunctions: (() => void)[] = [];
    
    // Debounce the thread updates to prevent rapid reconnections
    let threadUpdateTimeout: NodeJS.Timeout;
    
    // Subscribe to thread changes
    const unsubThread = onSnapshot(msgRef, (snap) => {
      if (!isSubscribed) return;
      
      const data = snap.data() as any;
      
      if (data?.thread) {
        // Get the latest message (should be the assistant's response)
        const latestMessage = data.thread[data.thread.length - 1];
        
        // Only add the message if it's not already in our thread
        if (latestMessage && (!thread.length || thread[thread.length - 1].ts !== latestMessage.ts)) {
          // Clear any pending updates
          clearTimeout(threadUpdateTimeout);
          // Debounce the thread update
          threadUpdateTimeout = setTimeout(() => {
            if (isSubscribed) {
              setThread(prev => [...prev, latestMessage]);
            }
          }, 100);
        }
      }
      
      setIsLoadingThread(false);
    }, (error) => {
      // Silently handle any Firebase errors
      if (error.code === 'permission-denied') {
        // Handle permission errors if needed
      }
    });

    unsubscribeFunctions.push(unsubThread);

    // Subscribe to initial prompt changes
    const indexRef = doc(
      db,
      "ideation",
      "koz-recipe-assistant",
      "indexes",
      currentAnimationIndex.toString()
    );

    const unsubPrompt = onSnapshot(indexRef, (snap) => {
      if (!isSubscribed) return;
      
      const data = snap.data() as any;
      setInitialPrompt(data?.initialPrompt || "");
    }, (error) => {
      // Silently handle any Firebase errors
      if (error.code === 'permission-denied') {
        // Handle permission errors if needed
      }
    });

    unsubscribeFunctions.push(unsubPrompt);

    return () => {
      isSubscribed = false;
      clearTimeout(threadUpdateTimeout);
      
      // Use a more graceful cleanup approach
      const cleanup = () => {
        unsubscribeFunctions.forEach(unsub => {
          try {
            unsub();
          } catch (error) {
            // Ignore unsubscribe errors
          }
        });
        unsubscribeFunctions = [];
      };

      // Try to cleanup immediately, but don't worry if it fails
      try {
        cleanup();
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, [currentAnimationIndex, msgRef, thread]);

  // Auto-scroll only when new messages are added
  useEffect(() => {
    if (!upperScrollRef.current) return;
    
    // Only scroll if thread length has increased
    if (thread.length > prevThreadLengthRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        upperScrollRef.current?.scrollTo({
          top: upperScrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
    
    // Update stored length for next comparison
    prevThreadLengthRef.current = thread.length;
  }, [thread]);

  // Auto-trigger followups based on thread state
  useEffect(() => {
    if (!msgRef || !initialPrompt) return;
    
    const userCount = thread.filter(m => m.role === 'user').length;
    const assistantCount = thread.filter(m => m.role === 'assistant').length;

    // Don't trigger if we're already thinking or if we have enough assistant messages
    if (isThinking || assistantCount >= 1) return;

    // For first user message, use our assistant-first-response API
    if (userCount === 1 && assistantCount === 0) {
      setIsThinking(true);
      const userMessage = thread.find(m => m.role === 'user');
      if (userMessage) {
        fetch('/bp-wparents/recipe-test/api/assistant-first-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: userMessage.text,
            initialPrompt,
            idx: currentAnimationIndex
          })
        })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.error) return;
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
          // Handle error silently
        })
        .finally(() => {
          setIsThinking(false);
        });
      }
      return;
    }
  }, [thread, msgRef, isThinking, currentAnimationIndex, initialPrompt]);

  // Add effect to cycle through thinking messages
  useEffect(() => {
    if (isThinking) {
      const messages = THINKING_MESSAGES[currentAnimationIndex] || THINKING_MESSAGES.default;
      
      // Clear any existing timer
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }

      // Reset message index
      setThinkingMessageIndex(0);

      // Set up timers for each message
      let currentIndex = 0;
      
      const showNextMessage = () => {
        if (currentIndex < messages.length - 1) {
          currentIndex++;
          setThinkingMessageIndex(currentIndex);
          
          // Only set up next timer if the current message has a duration
          if (messages[currentIndex].duration > 0) {
            thinkingTimerRef.current = setTimeout(showNextMessage, messages[currentIndex].duration);
          }
        }
      };

      // Start with first message and set timer for next message
      if (messages[0].duration > 0) {
        thinkingTimerRef.current = setTimeout(showNextMessage, messages[0].duration);
      }

      // Cleanup on unmount or when thinking stops
      return () => {
        if (thinkingTimerRef.current) {
          clearTimeout(thinkingTimerRef.current);
        }
      };
    } else {
      // Reset thinking message index when thinking stops
      setThinkingMessageIndex(0);
    }
  }, [isThinking, currentAnimationIndex]);

  const handleSubmit = async () => {
    if (!auth.currentUser || !input.trim()) return;
    setSubmitting(true);
    setIsThinking(true);
    
    // Add user message to thread immediately
    const userMessage = {
      role: "user",
      text: input.trim(),
      ts: Date.now(),
    };
    setThread(prev => [...prev, userMessage]);
    setLastUserMessage(input.trim());

    try {
      // Check if this is the third user message
      const userCount = thread.filter(m => m.role === 'user').length;
      const isThirdMessage = userCount === 2; // 0-based index, so 2 means third message

      const response = await fetch('/bp-wparents/recipe-test/api/assistant-first-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input.trim(),
          initialPrompt,
          idx: currentAnimationIndex
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Add both user message and assistant response to Firebase
      const newMessages = [
        userMessage,
        {
          role: "assistant",
          text: data.reply,
          ts: data.timestamp || Date.now(),
          step: data.step
        }
      ];

      // First try to update the existing document
      try {
        await updateDoc(msgRef!, {
          thread: arrayUnion(...newMessages),
          lastUpdated: serverTimestamp()
        });
      } catch (err: any) {
        // If document doesn't exist, create it
        if (err.code === "not-found") {
          await setDoc(msgRef!, {
            thread: newMessages,
            lastUpdated: serverTimestamp()
          });
        } else {
          throw err;
        }
      }

      // If this was the third message, send the final submission
      if (isThirdMessage) {
        const userMessages = [...thread.filter(m => m.role === 'user'), userMessage];
        const finalSubmission = userMessages.map(m => m.text).join('\n\n');
        await addSubmissionVersion(msgRef!, finalSubmission);
      }

      setInput("");
    } catch (error) {
      // Show error to user (you might want to add a UI element for this)
      alert("There was an error processing your message. Please try again.");
    } finally {
      setSubmitting(false);
      setIsThinking(false);
      setLastUserMessage(null);
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
    return thread;
  };

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-40 flex items-start justify-center transition-transform duration-300 ease-in-out transform ${drawerState === 'open' ? 'translate-y-0' : 'translate-y-[100vh]'}`}>
      {/* Overlay */}
      <div className={`absolute inset-0 bg-black opacity-50 transition-opacity duration-300 ease-in-out ${drawerState === 'open' ? 'opacity-50' : 'opacity-0 pointer-events-none'}`} onClick={handleCloseCommentDrawer}></div>

      {/* Drawer Content */}
      <div className="relative bg-transparent rounded-lg w-11/12 md:w-[600px] h-[80vh] md:h-[600px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Background Lottie */}
        <Lottie 
          animationData={CommentAnimation} 
          loop={true} 
          className="absolute inset-0 w-full h-full" 
        />

        {/* Upper pane */}
        <div
          className="absolute top-[5%] left-[10%] w-[80%] h-[40%] bg-white/90 text-black p-4 rounded overflow-y-auto text-xs md:text-base"
          ref={upperScrollRef}
        >
          {isLoadingThread ? (
            <div className="text-gray-500">Loading conversation...</div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Initial Prompt - Always shown */}
              <div className="mb-4 p-3 rounded bg-gray-100">
                <strong className="block mb-1 text-xs md:text-base">Initial Prompt:</strong>
                <div className="whitespace-pre-wrap text-xs md:text-base">{initialPrompt}</div>
              </div>

              {/* Thread Messages */}
              <div className="flex flex-col gap-4">
                {thread.map((msg, i) => (
                  <div key={i} className={`p-3 rounded ${msg.role === 'assistant' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <strong className="block mb-1 text-xs md:text-base">{msg.role === 'assistant' ? 'Assistant' : 'You'}:</strong>
                    <div className="prose prose-sm md:prose-base max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: props => (
                            <div className="overflow-x-auto">
                              <table className="min-w-full border-collapse border border-gray-300" {...props} />
                            </div>
                          ),
                          th: props => (
                            <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left" {...props} />
                          ),
                          td: props => (
                            <td className="border border-gray-300 px-4 py-2" {...props} />
                          ),
                          tr: props => (
                            <tr className="hover:bg-gray-50" {...props} />
                          ),
                          p: props => (
                            <p className="mb-4" {...props} />
                          ),
                          ul: props => (
                            <ul className="list-disc pl-5 mb-4" {...props} />
                          ),
                          ol: props => (
                            <ol className="list-decimal pl-5 mb-4" {...props} />
                          ),
                          li: props => (
                            <li className="mb-1" {...props} />
                          ),
                          code: props => (
                            <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />
                          ),
                          pre: props => (
                            <pre className="bg-gray-100 p-2 rounded mb-4 overflow-x-auto" {...props} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>

              {/* Current User Message */}
              {lastUserMessage && (
                <div className="p-3 rounded bg-gray-50">
                  <strong className="block mb-1">You:</strong>
                  <div className="whitespace-pre-wrap">{lastUserMessage}</div>
                </div>
              )}

              {/* Thinking State */}
              {isThinking && (
                <div className="p-3 rounded bg-blue-50 animate-pulse">
                  <strong className="block mb-1">Assistant:</strong>
                  <div className="text-gray-500">
                    {THINKING_MESSAGES[currentAnimationIndex]?.[thinkingMessageIndex]?.message || "Preparing answer..."}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lower pane */}
        <div className="absolute top-[48%] left-[10%] w-[80%] h-[40%] bg-white/90 text-black p-4 rounded flex flex-col z-10 text-xs md:text-base">
          {!isFinalState ? (
            <>
              <textarea
                className="flex-1 w-full p-2 border rounded resize-none text-xs md:text-base"
                placeholder="Type your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={submitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  className="px-4 py-2 border rounded disabled:opacity-50 text-xs md:text-base"
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
                <h3 className="font-bold text-xs md:text-base">Your Final Submission:</h3>
                <button
                  className="px-4 py-2 border rounded text-xs md:text-base"
                  onClick={isEditing ? handleSaveEdit : handleEdit}
                >
                  {isEditing ? "Save Edit" : "Edit Final"}
                </button>
              </div>
              {isEditing ? (
                <textarea
                  className="w-full h-full p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-base"
                  value={editedSubmission}
                  onChange={(e) => setEditedSubmission(e.target.value)}
                  autoFocus
                />
              ) : (
                <div className="whitespace-pre-wrap text-xs md:text-base">
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
