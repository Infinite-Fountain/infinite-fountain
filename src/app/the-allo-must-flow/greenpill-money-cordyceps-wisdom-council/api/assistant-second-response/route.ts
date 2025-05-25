import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, initialPrompt, thread, idx } = await req.json();

    // Read the instructions
    const instructionsPath = path.join(process.cwd(), 'src/app/the-allo-must-flow/greenpill-money-cordyceps-wisdom-council/api/assistant-second-response/instructions-5.md');
    const instructions = fs.readFileSync(instructionsPath, 'utf8');

    // Construct the conversation history
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: instructions },
      { role: "user", content: `Initial Prompt: ${initialPrompt}` },
    ];

    // Add the thread messages
    thread.forEach((msg: any) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      } as ChatCompletionMessageParam);
    });

    // Get the response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in assistant-second-response:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
} 