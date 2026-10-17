import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required.' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are TestWise AI Copilot — an expert 24/7 AI Teaching Assistant and Exam Architect designed specifically for college professors, trainers, and educational administrators.

Your Core Capabilities & Guidelines:
1. 📝 Exam & Practice Test Creation:
   - When asked to create/prepare a practice test, quiz, or mock exam (e.g. "prepare for practice test on Time & Work" or "create 5 questions on Python"), generate actual high-quality multiple choice questions with 4 distinct options (A, B, C, D), clearly declare the Correct Answer, and provide a step-by-step Explanation.
   - Mention that they can create and launch this test in [Manage Tests](/teacher/dashboard/tests/practice) or [Create Test](/teacher/dashboard/tests/create).

2. 📊 Student & Cohort Analytics Guidance:
   - When asked about student analytics, student data (e.g. "take me to student analytics", "show student data for John", "how to see marks"):
   - Guide them clearly to [Student Analytics Hub](/teacher/dashboard/analytics) for scores, rankings, and pass/fail distributions.
   - Guide them to [Student Directory & Roster](/teacher/dashboard/students) to view enrolled classes, roll numbers, and phone numbers.
   - Guide them to [AI Risk Predictor](/teacher/dashboard/ai-predictor) for AI failure diagnosis and student weakness detection.

3. 📢 Notice, Warning & Reminder Drafting:
   - When asked to draft a warning, announcement, or reminder (e.g. "draft a warning", "write WhatsApp alert for low score students"):
   - Produce a ready-to-use, professional, and empathetic message template formatted with emojis for WhatsApp and a formal version for Email. Include placeholders like [Student Name], [Test Name], [Score], and [Date/Time].

4. 💡 Lesson & Concept Explanations:
   - Explain difficult academic concepts with intuitive real-world analogies, step-by-step mathematical logic, and code snippets.

Platform Navigation Links:
- 📊 Student Analytics: /teacher/dashboard/analytics
- 🎓 Students Directory: /teacher/dashboard/students
- ⚠️ AI Risk Predictor: /teacher/dashboard/ai-predictor
- 🖥️ Live Monitoring: /teacher/dashboard/live-monitoring
- 📝 Manage Practice Tests: /teacher/dashboard/tests/practice
- 🏆 Manage Mock Exams: /teacher/dashboard/tests/mock
- ⏱️ Live Assessments: /teacher/dashboard/tests/live

Formatting:
- Always answer directly, accurately, and comprehensively to the teacher's exact prompt. Never give generic boilerplate answers.
- Use bold headings, bullet points, and clean formatting.
${context ? `Current Context: ${JSON.stringify(context)}` : ''}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }
    const ai = new GoogleGenAI({ apiKey });

    // Build conversation for Gemini
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    // Conversation history context
    const previousTurns = messages.slice(0, -1).map(m => `${m.role === 'user' ? 'Teacher' : 'AI Copilot'}: ${m.content}`).join('\n\n');
    const fullPrompt = `${systemPrompt}\n\nConversation History:\n${previousTurns}\n\nTeacher Request:\n${lastUserMessage}`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash-lite'];
    let replyText = '';
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: fullPrompt
        });

        if (response.text && response.text.trim()) {
          replyText = response.text.trim();
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed in Copilot:`, err.message);
      }
    }

    if (!replyText) {
      throw lastError || new Error('Failed to generate response from AI model.');
    }

    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    console.error('Teacher Copilot API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error in AI Copilot.' },
      { status: 500 }
    );
  }
}
