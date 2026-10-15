import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is missing." }, { status: 500 });
    }

    const { testHistory } = await req.json();

    if (!testHistory || testHistory.length === 0) {
      return NextResponse.json({ summary: "No test history available to analyze." });
    }

    const prompt = `
      You are an expert educational AI mentor. Analyze the following test history for a student and provide a personalized, encouraging performance report.
      Identify key strengths, weaknesses, and a recommended action plan.
      
      Test History Data:
      ${JSON.stringify(testHistory.map((t: any) => ({
        TestName: t.tests?.title,
        Category: t.tests?.category,
        Score: t.score,
        Warnings: t.warnings_issued,
        Date: t.completed_at
      })), null, 2)}
      
      Output the report in Markdown format with clearly defined sections: 
      - 🚀 Overall Progress
      - 🏆 Strengths
      - ⚠️ Areas for Improvement
      - 🎯 Action Plan
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    const responseText = response.text || '';

    return NextResponse.json({ report: responseText });
  } catch (error: any) {
    console.error("AI Prediction Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate AI report" }, { status: 500 });
  }
}

