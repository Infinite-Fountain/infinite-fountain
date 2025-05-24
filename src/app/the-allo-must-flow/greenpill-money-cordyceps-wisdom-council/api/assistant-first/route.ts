export const runtime = 'nodejs';    // Force Node.js runtime

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log('Received prompt:', prompt);

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
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