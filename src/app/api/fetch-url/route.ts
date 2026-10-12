import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: 500 });
    }

    const html = await res.text();
    // A very simple regex-based tag stripper (not perfect, but good enough for getting basic content out of a link for AI)
    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('Error fetching URL:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch URL' }, { status: 500 });
  }
}

