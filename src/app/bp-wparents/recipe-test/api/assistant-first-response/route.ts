import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { idx } = await req.json();
    console.log('Received request for index:', idx);
    
    const filePath = path.join(process.cwd(), 'src/app/bp-wparents/recipe-test/data', `ideation-koz-recipe-assistant-indexes-${idx}.json`);
    console.log('Loading file from:', filePath);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `No file found for index ${idx}` },
        { status: 404 }
      );
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('File loaded successfully');
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Detailed error in assistant-first-response:", error);
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