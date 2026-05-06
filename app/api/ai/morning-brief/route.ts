import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { followupsDue = [], openTasks = [], activeRoles = 0, pendingCandidates = 0 } = body;

  const contextSummary = `
CONTRARIO OPS CONTEXT:
- ${activeRoles} active roles across clients
- ${pendingCandidates} candidates pending response
- ${followupsDue.length} follow-ups due today
- ${openTasks.length} open tasks

FOLLOW-UPS DUE TODAY:
${followupsDue.slice(0, 8).map((f: any) => `• ${f.name} → ${f.role?.title || 'Unknown role'} at ${f.role?.client?.name || 'Unknown client'} (${f.days}d since intro, Round ${f.followup_round + 1})`).join('\n') || 'None'}

OPEN TASKS:
${openTasks.slice(0, 5).map((t: any) => `• [${t.priority?.toUpperCase()}] ${t.title}${t.client?.name ? ` — ${t.client.name}` : ''}`).join('\n') || 'None'}
`.trim();

  const systemPrompt = `You are Lucía's AI operations co-pilot at Contrario — a managed recruiting marketplace.
Contrario manages 110+ active roles across 39 clients, with Lucía as Ops Lead managing the full pipeline.

Write a sharp morning brief for Lucía. No fluff. No "Good morning!" opener. Start with the most critical item immediately.

Structure:
**Priority Queue** — ranked list of the 3 most urgent actions (follow-ups overdue, tasks due, blockers)
**Follow-Up Alerts** — specific candidates to chase today with context on why they're urgent
**Today's Focus** — one sentence on what matters most today

Keep it under 200 words. Be specific. Use the data provided.`;

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Generate my morning brief.\n\n${contextSummary}` }],
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
