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
    
    console.log('Received request:', { idx, hasPrompt: !!prompt, hasInitialPrompt: !!initialPrompt });
    
    // Validate idx parameter
    if (idx === undefined || idx === null) {
      console.error('Missing idx parameter');
      return NextResponse.json({ error: "Missing idx parameter" }, { status: 400 });
    }
    
    const index = Number(idx);
    if (isNaN(index)) {
      console.error('Invalid idx parameter:', idx);
      return NextResponse.json({ error: "Invalid idx parameter" }, { status: 400 });
    }
    
    // If we have a prompt, this is a user response
    if (prompt) {
      console.log('Processing user response for index:', index);
      
      // Step 1: Read and analyze the product data
      const dataPath = path.join(process.cwd(), 'src/app/bp-wparents/recipe-test/data', `ideation-koz-recipe-assistant-indexes-${index}.json`);
      let products: Product[] = [];
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        products = JSON.parse(data);
        console.log('Loaded product data:', { count: products.length });
      } else {
        console.error('Product data file not found:', dataPath);
        return NextResponse.json({ error: "Product data file not found" }, { status: 404 });
      }
      
      // Step 2: Read the instructions
      const instructionsPath = path.join(process.cwd(), 'src/app/bp-wparents/recipe-test/api/assistant-first-response', `instructions-${index}.md`);
      let instructions = "";
      if (fs.existsSync(instructionsPath)) {
        instructions = fs.readFileSync(instructionsPath, 'utf8');
        console.log('Loaded instructions for step:', index);
      } else {
        console.error('Instructions file not found:', instructionsPath);
        return NextResponse.json({ error: "Instructions file not found" }, { status: 404 });
      }
      
      // Step 3: Process user's answer and generate response using OpenAI
      console.log('Generating OpenAI response...');
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
      console.log('Generated response:', response);
      
      // Step 4: Return the response to be added to the thread
      return NextResponse.json({ 
        reply: response,
        timestamp: Date.now(),
        step: index,
        status: 'success'
      });
    }
    
    // If no prompt is provided, this is the initial load
    if (initialPrompt) {
      console.log('Returning initial prompt');
      return NextResponse.json({ 
        reply: initialPrompt,
        timestamp: Date.now(),
        step: index,
        status: 'success'
      });
    }
    
    // Otherwise, fetch from Firebase
    console.log('Fetching from Firebase for index:', index);
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
      console.log('Retrieved initial prompt from Firebase');
    } else {
      console.log('No data found in Firebase');
    }
    
    return NextResponse.json({ 
      reply: content,
      timestamp: Date.now(),
      step: index,
      status: 'success'
    });
  } catch (error) {
    console.error("Error in assistant-first-response:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 