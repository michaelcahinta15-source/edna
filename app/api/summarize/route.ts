import { NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini';
import { upstashService } from '@/lib/upstash';

export async function POST(request: Request) {
  try {
    const { body } = await request.json();

    if (!body || typeof body !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Check cache for summary (optional, but we can use a hash of the body as key)
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(body).digest('hex');
    const cacheKey = `summary:${hash}`;
    let summary = await upstashService.get<string>(cacheKey);

    if (!summary) {
      // Generate summary using Gemini
      summary = await geminiService.summarizeEmail(body);
      // Cache the summary for 1 hour
      await upstashService.set(cacheKey, summary, { ttl: 3600 });
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error in summarize API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}