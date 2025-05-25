export const runtime = 'nodejs';    // Force Node.js runtime

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, initialPrompt, idx } = await req.json();
    console.log('Received request:', { prompt, initialPrompt, idx });

    // Load instructions for the specific index
    const instructionsPath = path.join(
      process.cwd(),
      'src/app/the-allo-must-flow/greenpill-money-cordyceps-wisdom-council/api/assistant-first-response',
      `instructions-${idx}.md`
    );

    let instructions: string;
    try {
      instructions = await fs.readFile(instructionsPath, 'utf-8');
    } catch (err) {
      console.error(`Failed to load instructions for index ${idx}:`, err);
      return NextResponse.json(
        { error: `Missing instructions for index ${idx}` },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: `${instructions}\n\nInitial prompt: ${initialPrompt}` },
        { role: "user", content: prompt }
      ],
      model: "o4-mini",
    });

    const reply = completion.choices[0]?.message?.content || 'No response generated';
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('[/api/assistant-first-response] Detailed error:', {
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