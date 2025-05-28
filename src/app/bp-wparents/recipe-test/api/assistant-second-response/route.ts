import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '../../../../../firebaseClient';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { idx } = await req.json();
    console.log('Received request for index:', idx);
    
    // First try to get initialPrompt from Firebase
    const indexRef = doc(
      db,
      "ideation",
      "koz-recipe-assistant",
      "indexes",
      idx.toString()
    );
    
    const docSnap = await getDoc(indexRef);
    let content = "";
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      content = data.initialPrompt || "";
      console.log('Loaded initialPrompt from Firebase');
    } else {
      console.log('No Firebase data found, falling back to instructions file');
      // If no Firebase data, try to get instructions from the markdown file
      const instructionsPath = path.join(process.cwd(), 'src/app/bp-wparents/recipe-test/api/assistant-second-response', `instructions-${idx}.md`);
      console.log('Loading instructions from:', instructionsPath);
      
      if (fs.existsSync(instructionsPath)) {
        content = fs.readFileSync(instructionsPath, 'utf8');
        console.log('Instructions loaded successfully');
      }
    }
    
    return NextResponse.json({ reply: content });
  } catch (error) {
    console.error("Detailed error in assistant-second-response:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 