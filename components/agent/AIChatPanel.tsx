'use client';

import { useRef, useState } from 'react';
import { Send, Loader2, Bot, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { label: 'Draft today\'s nudges', prompt: 'List the candidates who need a follow-up today and draft a nudge for each in Contrario voice.' },
  { label: 'Write a Slack reply', prompt: 'Help me write a reply to a Slack message in Contrario voice. What context should I give you?' },
  { label: 'Summarize attention items', prompt: 'Based on the current ops context, what needs my attention most urgently right now?' },
  { label: 'Create a JD package', prompt: 'I need to create a JD package. Ask me for the role details.' },
];

export default function AIChatPanel({ context }: { context?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function send(userContent: string) {
    if (!userContent.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: userContent.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context }),
      });
      if (!res.ok) throw new Error('Request failed');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        setMessages([...newMessages, { role: 'assistant', content: full }]);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Check ANTHROPIC_API_KEY.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-gold" />
          <span className="font-display font-semibold text-sm">AI Co-pilot</span>
        </div>
        <p className="text-xs text-muted mt-0.5">Contrario context loaded</p>
      </div>

      {messages.length === 0 && (
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted mb-3">Quick actions:</p>
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => send(a.prompt)}
              className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border hover:border-gold/40 hover:bg-elevated/50 transition-colors text-muted hover:text-fg"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gold/15 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={11} className="text-gold" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] text-sm rounded-2xl px-3 py-2 whitespace-pre-wrap',
                m.role === 'user'
                  ? 'bg-gold/15 text-fg rounded-tr-sm'
                  : 'bg-elevated text-fg rounded-tl-sm'
              )}
            >
              {m.content || (loading && i === messages.length - 1 ? <Loader2 size={12} className="animate-spin text-muted" /> : '')}
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-elevated flex items-center justify-center shrink-0 mt-0.5">
                <User size={11} className="text-muted" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything…"
            rows={1}
            className="flex-1 bg-elevated border border-border rounded-xl px-3 py-2 text-sm resize-none focus:border-gold/50 focus:outline-none min-h-[38px] max-h-[120px]"
            style={{ height: 'auto' }}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="shrink-0 w-9 h-9 rounded-xl bg-gold text-black flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-[10px] text-muted mt-1.5 text-center">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
