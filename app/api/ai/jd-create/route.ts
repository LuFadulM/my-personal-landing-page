import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { company, role, compensation, equity, ote, requirements, interviewStages, notes } = await req.json();

  const systemPrompt = `You are a senior recruiting operations specialist at Contrario producing complete JD packages.

Rules:
- Never include unverified traction claims (e.g. ARR figures without a source)
- Equity is always separate from base salary — never conflate them
- OTE is always separate from base — show both explicitly
- YOE cap: 8 years max unless the role specifies otherwise
- Venture-backed signal (≥$10M raised) must be called out if applicable
- Lead with traction and momentum, not generic company descriptions
- Role bullets are outcome-framed ("You will own X" not "Responsible for X")

Output format — produce the complete package in these labeled sections:

## JD BODY
[2–3 sentence company description leading with traction. About the Role paragraph. What You'll Own (4–6 outcome-framed bullets). Requirements chips: Must-have and Nice-to-have. Who Will Thrive Here (2–3 behavioral signals). Interview Process stages.]

## SEQ 1 — COLD OUTREACH
[Under 80 words. Hook on why this role/company is compelling. No re-pitch after this.]

## SEQ 2 — FOLLOW-UP
[Under 60 words. Same thread. Nudge. Reference one specific thing about the role. No re-pitch.]

## SEQ 3 — FINAL NUDGE
[Under 60 words. New thread. Mild timeline urgency. Last attempt tone.]

## INTRO EMAIL
[Personalized intro connecting candidate to role. Under 100 words.]

Pre-publish flags to check: equity vs salary separation, OTE shown separately, no unverified ARR claims.`;

  const userPrompt = `Create a full JD package for:

Company: ${company}
Role: ${role}
Base Compensation: ${compensation || 'Not specified'}
Equity: ${equity || 'Not specified'}
OTE: ${ote || 'Not specified'}
Key Requirements: ${requirements || 'Not specified'}
Interview Stages: ${interviewStages || 'Not specified'}
Additional Notes: ${notes || 'None'}`;

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
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
