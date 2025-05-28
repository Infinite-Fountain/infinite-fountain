export const runtime = 'nodejs';    // Force Node.js runtime

import { NextResponse } from 'next/server';
import { db } from '../../../../../firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Product {
  brand_product: string;
  price_per_15oz_usd: number;
  sodium_per_serving_mg: number;
  organic: boolean;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idx, prompt, initialPrompt } = body;
    
    // Validate idx parameter
    if (idx === undefined || idx === null) {
      return NextResponse.json({ error: "Missing idx parameter" }, { status: 400 });
    }
    
    const index = Number(idx);
    if (isNaN(index)) {
      return NextResponse.json({ error: "Invalid idx parameter" }, { status: 400 });
    }
    
    // If we have a prompt, this is a user response
    if (prompt) {
      // Step 1: Read and analyze the product data
      const dataPath = path.join(process.cwd(), 'src/app/bp-wparents/recipe-test/data', `ideation-koz-recipe-assistant-indexes-${index}.json`);
      let products: Product[] = [];
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        products = JSON.parse(data);
      } else {
        return NextResponse.json({ error: "Product data file not found" }, { status: 404 });
      }
      
      // Step 2: Read the instructions
      const instructionsPath = path.join(process.cwd(), 'src/app/bp-wparents/recipe-test/api/assistant-first-response', `instructions-${index}.md`);
      let instructions = "";
      if (fs.existsSync(instructionsPath)) {
        instructions = fs.readFileSync(instructionsPath, 'utf8');
      } else {
        return NextResponse.json({ error: "Instructions file not found" }, { status: 404 });
      }
      
      // Step 3: Process user's answer and generate response using OpenAI
      const completion = await openai.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: `${instructions}\n\nProduct Data: ${JSON.stringify(products)}\n\nInitial prompt: ${initialPrompt}` 
          },
          { role: "user", content: prompt }
        ],
        model: "gpt-4-turbo-preview",
      });

      const response = completion.choices[0]?.message?.content || 'No response generated';
      
      // Step 4: Return the response to be added to the thread
      return NextResponse.json({ reply: response });
    }
    
    // If no prompt is provided, this is the initial load
    if (initialPrompt) {
      return NextResponse.json({ reply: initialPrompt });
    }
    
    // Otherwise, fetch from Firebase
    const indexRef = doc(
      db,
      "ideation",
      "koz-recipe-assistant",
      "indexes",
      index.toString()
    );
    
    const docSnap = await getDoc(indexRef);
    let content = "";
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      content = data.initialPrompt || "";
    }
    
    return NextResponse.json({ reply: content });
  } catch (error) {
    console.error("Error in assistant-first-response:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 