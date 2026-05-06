import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { candidate, role, client: clientName, round, daysSince } = await req.json();

  const systemPrompt = `You are a senior recruiting operations specialist at Contrario writing follow-up emails.

Contrario voice rules:
- Direct, no fluff, no filler phrases like "hope you're well" or "just checking in"
- Under 60 words
- No bullets
- No sign-off beyond "Best, The Contrario Team"
- Never re-pitch the role — assume they already know it
- Goal: get the candidate to book or respond
- Subject line: leave blank (same thread, no new subject)

Round context:
- SEQ 1: intro (already sent)
- SEQ 2 (day 5–7, same thread): light nudge, mention one specific thing about the role
- SEQ 3 (day 7–10, new thread): final attempt, create mild urgency around timeline

Output format — respond with ONLY a JSON object:
{"subject": "", "body": "...email body here..."}`;

  const userPrompt = `Write a follow-up email for:
Candidate: ${candidate}
Role: ${role}
Company: ${clientName}
Days since intro: ${daysSince}
Follow-up round: ${round} (so this is SEQ ${round + 1})`;

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
}
