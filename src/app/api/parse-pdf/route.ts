import { NextResponse } from 'next/server';
import zlib from 'zlib';
import { GoogleGenAI } from '@google/genai';

// Allow Vercel serverless function up to 60s execution
export const maxDuration = 60;

// Fast, zero-worker native PDF stream text extractor
function extractTextFromPdfBuffer(buffer: Buffer): string {
  let fullText = '';
  const content = buffer.toString('binary');

  // Find all streams: stream\r?\n ... \r?\nendstream
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match;
  while ((match = streamRegex.exec(content)) !== null) {
    const streamRaw = Buffer.from(match[1], 'binary');
    let decompressed = '';
    try {
      decompressed = zlib.inflateSync(streamRaw).toString('utf-8');
    } catch {
      try {
        decompressed = zlib.unzipSync(streamRaw).toString('utf-8');
      } catch {
        decompressed = streamRaw.toString('utf-8');
      }
    }

    // Extract text in (text) Tj
    const tjRegex = /\(([\s\S]*?)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(decompressed)) !== null) {
      fullText += tjMatch[1] + ' ';
    }

    // Extract text in [(t1) 120 (t2)] TJ
    const arrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrMatch;
    while ((arrMatch = arrayRegex.exec(decompressed)) !== null) {
      const innerTj = /\(([\s\S]*?)\)/g;
      let inMatch;
      while ((inMatch = innerTj.exec(arrMatch[1])) !== null) {
        fullText += inMatch[1] + ' ';
      }
    }
  }

  // Clean up escape characters and normalize whitespace
  return fullText
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\r/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

async function extractTextWithGemini(buffer: Buffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return '';

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = buffer.toString('base64');
  const models = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.8-flash'];

  for (const model of models) {
    try {
      const resp = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: base64Data
                }
              },
              {
                text: 'Extract and transcribe all the text, questions, and learning material from this PDF document verbatim. Return only the extracted text without any preamble, conversational commentary, or markdown backticks.'
              }
            ]
          }
        ]
      });
      if (resp.text && resp.text.trim()) {
        return resp.text.trim();
      }
    } catch (e: any) {
      console.warn(`Gemini extraction with ${model} failed:`, e.message);
    }
  }
  return '';
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    // Step 1: Try native pure-JS stream extractor (instant, zero-worker, 100% serverless safe)
    try {
      extractedText = extractTextFromPdfBuffer(buffer);
    } catch (e) {
      console.warn('Native PDF stream extraction failed:', e);
    }

    // Step 2: If native extraction got little text (e.g., scanned PDF or complex encoding), use Gemini OCR
    if (!extractedText || extractedText.length < 30) {
      try {
        const geminiText = await extractTextWithGemini(buffer);
        if (geminiText) {
          extractedText = geminiText;
        }
      } catch (e) {
        console.warn('Gemini PDF extraction failed:', e);
      }
    }

    const trimmedText = extractedText.trim();
    if (!trimmedText) {
      return NextResponse.json({
        error: 'Could not extract text from this PDF. Please ensure the document is not empty or password-protected, or paste the text directly into the box.'
      }, { status: 400 });
    }

    return NextResponse.json({ text: trimmedText });
  } catch (error: any) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse PDF' }, { status: 500 });
  }
}
