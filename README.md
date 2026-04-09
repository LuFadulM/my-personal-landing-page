# OpsOS — Recruiting Operations System

Lean, production-ready internal tool for recruiting operations.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma ORM + PostgreSQL
- Auth.js v5 (Google)
- Server Actions (no API routes)

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
cp .env.example .env   # fill in DATABASE_URL and AUTH_GOOGLE_* creds
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo on Vercel
3. Add environment variables from `.env.example` (use Vercel Postgres for `DATABASE_URL`)
4. Deploy — the build runs `prisma generate && next build` automatically

## AI Layer

`lib/ai.ts` exposes three functions: `generateJD`, `generateEmail`, `summarizeQA`. They return deterministic mocks out of the box. To wire them to a real model, add `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` to your env and replace the mock bodies.

## Project Structure

```
/app          — Next.js App Router pages
/components   — UI components (shadcn-style in /ui, plus layout)
/lib          — utils, db client, auth, AI layer
/actions      — Server Actions grouped by entity
/prisma       — schema.prisma
```
