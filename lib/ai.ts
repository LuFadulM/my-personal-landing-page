/**
 * AI layer — modular prompts with mock fallbacks.
 *
 * Add an ANTHROPIC_API_KEY or OPENAI_API_KEY to wire these up to a real
 * model. Until then, the functions return deterministic, useful mocks so
 * the rest of the app works end-to-end.
 */

export interface GenerateJDInput {
  title: string;
  company: string;
  seniority: string;
  notes?: string;
}

export async function generateJD(input: GenerateJDInput): Promise<string> {
  const { title, company, seniority, notes } = input;

  // TODO: replace with real model call.
  // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  // const res = await client.messages.create({ model: 'claude-sonnet-4-6', ... });

  return `## ${seniority} ${title} @ ${company}

**About the Role**
${company} is hiring a ${seniority.toLowerCase()} ${title.toLowerCase()} to help accelerate our mission. You'll work directly with founders on high-impact problems from day one.

**Responsibilities**
- Own critical workstreams end-to-end and ship quickly.
- Collaborate closely with engineering, product, and design.
- Raise the technical bar across the team.
${notes ? `- ${notes}\n` : ''}
**What We're Looking For**
- ${seniority === 'Senior' || seniority === 'Staff' ? '5+' : '2+'} years of relevant experience.
- Strong ownership and bias toward action.
- Excellent written and verbal communication.

**Bonus**
- Experience in a high-growth startup environment.
- Track record of shipping products that users love.`;
}

export interface GenerateEmailInput {
  recipient: string;
  type: 'candidate' | 'client' | 'recruiter';
  purpose?: string;
  context?: string;
}

export async function generateEmail(input: GenerateEmailInput): Promise<{
  subject: string;
  content: string;
}> {
  const { recipient, type, purpose, context } = input;
  const firstName = recipient.split(' ')[0] || recipient.split('@')[0];

  const templates = {
    candidate: {
      subject: purpose || 'Next steps on your application',
      body: `Hi ${firstName},\n\nThanks for taking the time to chat with us — the team really enjoyed the conversation. ${context || 'We think there could be a strong fit here.'}\n\nAs next steps, I'll be coordinating a follow-up with the hiring manager. Could you share a few windows of availability for a 30-minute call next week?\n\nLooking forward to continuing the conversation.\n\nBest,\nContrario Team`,
    },
    client: {
      subject: purpose || 'Pipeline update',
      body: `Hi ${firstName},\n\nQuick update on the search. ${context || 'We have a few strong candidates moving through the pipeline.'}\n\nLet me know if there's a good time this week for a 15-minute sync to walk through profiles and align on next steps.\n\nBest,\nContrario Team`,
    },
    recruiter: {
      subject: purpose || 'Coordination on open roles',
      body: `Hi ${firstName},\n\nThanks for the hand-off. ${context || 'Looping in here to align on the latest candidates.'}\n\nCould you confirm who owns outreach on the active roles and share any blockers from your side? I'd like to make sure we're not duplicating efforts.\n\nBest,\nContrario Team`,
    },
  };

  return {
    subject: templates[type].subject,
    content: templates[type].body,
  };
}

export async function summarizeQA(notes: string): Promise<string> {
  if (!notes.trim()) return 'No notes provided.';

  const lines = notes.split('\n').filter((l) => l.trim());
  const first = lines.slice(0, 2).join(' ');

  return `**Summary**
${first.slice(0, 200)}${first.length > 200 ? '...' : ''}

**Key Observations**
- Candidate engagement: appears positive based on the detailed notes captured.
- Technical depth: review session covered multiple areas.
- Communication: recruiter provided structured feedback.

**Recommended Next Steps**
- Share feedback with the hiring team within 24 hours.
- Schedule follow-up if candidate scored above 7.
- Flag any risk areas for the next-round interviewer.`;
}
