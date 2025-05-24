export const runtime = 'nodejs';    // Force Node.js runtime

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load instructions
const instructions = fs.readFileSync(
  path.join(process.cwd(), 'src/app/the-allo-must-flow/greenpill-money-cordyceps-wisdom-council/api/assistant-first/instructions.md'),
  'utf-8'
);

export async function POST(req: Request) {
  try {
    const { prompt, initialPrompt } = await req.json();
    console.log('Received prompt:', prompt);
    console.log('Initial prompt:', initialPrompt);

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: `${instructions}\n\nInitial prompt: ${initialPrompt}` },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
    });

    const reply = completion.choices[0]?.message?.content || 'No response generated';
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('[/api/assistant-first] Detailed error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      cause: err.cause
    });
    return NextResponse.json(
      { error: err.message || 'unknown_error' },
      { status: 500 }
    );
  }
} 