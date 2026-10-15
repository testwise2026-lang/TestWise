import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Allow Vercel serverless function up to 60s execution
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, contextText } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    let systemPrompt = `You are an expert assessment and exam question creator. 
Generate multiple choice questions based on the topic or reference material provided.
Your output MUST be a strict, valid JSON array of objects. Do not include any markdown fences, backticks, or other text outside the JSON array.
Each question object MUST follow this schema:
{
  "question_text": "The question string",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0,
  "explanation": "Brief explanation of the correct answer"
}`;

    if (contextText && contextText.trim()) {
      // Limit context to ~15,000 characters to keep latency fast
      const trimmedContext = contextText.trim().slice(0, 15000);
      systemPrompt += `\n\nREFERENCE MATERIAL:\n"""\n${trimmedContext}\n"""\n\nFormulate your questions strictly using the facts and information in the reference material.`;
    }

    // Fast, high-capacity models with fallback
    const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.8-flash'];
    let text = '';
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            { role: 'user', parts: [{ text: systemPrompt + '\n\nInstructions: ' + prompt }] }
          ],
          config: {
            responseMimeType: "application/json",
          }
        });
        if (response.text && response.text.trim()) {
          text = response.text.trim();
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} generation attempt failed:`, err.message);
      }
    }

    if (!text) {
      throw lastError || new Error("Failed to receive response from AI model.");
    }

    // Strip markdown code fences if model wrapped response in ```json ... ```
    let cleanJson = text;
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    }

    // Parse the JSON array
    const questions = JSON.parse(cleanJson);
    
    if (!Array.isArray(questions)) {
      throw new Error("AI output was not a valid list of questions.");
    }

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
