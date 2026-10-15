import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Allow Vercel serverless function up to 60s execution
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, contextText, difficulty, count, generateThreeTests } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const qCount = count || 5;
    let systemPrompt = '';

    if (generateThreeTests) {
      systemPrompt = `You are an expert assessment and competitive exam question creator.
Your goal is to generate 3 SEPARATE test question sets for the topic: "${prompt}".
1. "easy": Exactly ${qCount} Easy / Level 1 questions (fundamental concepts, definitions, direct formula applications).
2. "medium": Exactly ${qCount} Medium / Level 2 questions (multi-step calculations, analytical questions, standard exam problems).
3. "hard": Exactly ${qCount} Hard / Level 3 questions (advanced problem solving, non-trivial traps, tricky conditions, expert level).

Output MUST be a strict, valid JSON object with EXACTLY three keys: "easy", "medium", and "hard".
Do not include any markdown fences or text outside the JSON object.
Schema:
{
  "easy": [
    {
      "question_text": "Question string",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Clear step-by-step mathematical/logical explanation"
    }
  ],
  "medium": [ ... ],
  "hard": [ ... ]
}`;
    } else {
      systemPrompt = `You are an expert assessment and exam question creator. 
Generate multiple choice questions based on the topic or reference material provided.
Your output MUST be a strict, valid JSON array of objects. Do not include any markdown fences, backticks, or other text outside the JSON array.
Each question object MUST follow this schema:
{
  "question_text": "The question string",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer": 0,
  "explanation": "Clear, detailed step-by-step explanation of the correct answer and why other options are incorrect"
}`;

      if (difficulty) {
        if (difficulty === 'PROGRESSIVE') {
          systemPrompt += `\n\nDIFFICULTY REQUIREMENT: Progressive 3-Level split — provide a balanced progression from Level 1 (Easy) to Level 2 (Medium) to Level 3 (Hard).`;
        } else {
          systemPrompt += `\n\nDIFFICULTY LEVEL: All questions MUST strictly be of ${difficulty} difficulty.`;
        }
      }

      if (count) {
        systemPrompt += `\n\nQUESTION COUNT: Generate exactly ${count} questions.`;
      }
    }

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

    // Parse the JSON
    const parsed = JSON.parse(cleanJson);
    
    if (generateThreeTests) {
      const easy = Array.isArray(parsed?.easy) ? parsed.easy : [];
      const medium = Array.isArray(parsed?.medium) ? parsed.medium : [];
      const hard = Array.isArray(parsed?.hard) ? parsed.hard : [];
      
      if (easy.length === 0 && medium.length === 0 && hard.length === 0) {
        throw new Error("AI failed to generate 3 test sets.");
      }
      return NextResponse.json({ threeTests: { easy, medium, hard } });
    }

    if (!Array.isArray(parsed)) {
      throw new Error("AI output was not a valid list of questions.");
    }

    return NextResponse.json({ questions: parsed });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
