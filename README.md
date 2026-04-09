# OpsOS — Recruiting Operations System

Lean, personal internal tool for recruiting operations. **No database, no auth, no setup — just deploy and use.**

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui components
- localStorage for data persistence

## Features

- **Dashboard** — overview cards for daily ops
- **Job Descriptions** — create/edit JDs with AI generation
- **Tasks** — list view with status cycling and priorities
- **Emails** — lightweight tracker with AI generation
- **Docs** — SOP and knowledge base with search
- **QA Reviews** — scored reviews with AI summarization

## Automations

- When an Email is set to `sent`, a follow-up Task is auto-created
- When a Job Description is created, a "Review JD" Task is auto-created

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000. That's it.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo on Vercel
3. Click Deploy

No environment variables, no build command changes, no database setup. It just works.

## Data Storage

All data lives in your browser's localStorage. This means:
- ✅ Zero infrastructure
- ✅ Works offline
- ✅ Instant deploys
- ⚠️ Data is per-browser (doesn't sync across devices)

If you ever need cross-device sync, swap `lib/store.ts` for a real backend (Supabase, Firebase, Prisma+Postgres, etc.) — the rest of the app won't need to change.

## AI Layer

`lib/ai.ts` exposes three functions: `generateJD`, `generateEmail`, `summarizeQA`. They return deterministic mocks out of the box. To wire them to a real model, add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` and replace the mock bodies.

## Project Structure

```
/app          — Next.js App Router pages (all client components)
/components   — UI components (shadcn-style in /ui, plus layout)
/lib          — utils, localStorage store, AI layer
```
