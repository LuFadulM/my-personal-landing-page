import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json();

  const systemPrompt = `You are Lucía's AI operations co-pilot at Contrario — a managed recruiting marketplace.

About Contrario:
- Managed recruiting marketplace with Lucía as Ops Lead
- 110+ active roles across 39 clients
- 236+ candidates pending client approval
- Team of independent recruiters on the platform

Key rules you always follow:
- All outreach is in Contrario voice: direct, no fluff, under 60 words for follow-ups
- Never include unverified traction claims in JDs (e.g., ARR figures without a source)
- Equity is separate from base salary — never list equity in the salary field
- OTE is separate from base — always show both
- Follow-up cadence: SEQ1 (intro) → SEQ2 (day 5–7, same thread) → SEQ3 (day 7–10, new thread)
- Candidate submissions require a venture-backed (≥$10M) signal called out at top of summary
- YOE cap: 8 years max on relevant experience unless role specifies otherwise

Current ops context:
${context || 'No additional context provided.'}

Be concise and actionable. When drafting emails or messages, follow Contrario voice exactly.`;

  const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
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
