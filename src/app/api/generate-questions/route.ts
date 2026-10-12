import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, contextText } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set in environment variables.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let systemPrompt = `You are an expert test creator. Generate multiple choice questions based on the user's topic or instructions.
Your response MUST be a valid JSON array of objects, with no markdown formatting, no backticks, and no extra text. 
Format of each object:
{
  "question_text": "The question string",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0, // integer index (0-3) of the correct option
  "explanation": "Brief explanation of why the answer is correct"
}`;

    if (contextText) {
      systemPrompt += `\n\nREFERENCE MATERIAL:\n"""\n${contextText}\n"""\n\nBase your questions strictly on the reference material provided above.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\nInstructions: ' + prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No text returned from Gemini");
    }
    
    // Parse the JSON array
    const questions = JSON.parse(text);
    
    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

