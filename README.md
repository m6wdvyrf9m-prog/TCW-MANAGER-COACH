# The Colour Works Manager Coach

Production-ready coaching application for managers using their confirmed Insights Discovery preference context.

## What It Does

- Starts a persistent private coaching session URL
- Securely uploads and parses an Insights Discovery PDF
- Deletes/discards the uploaded PDF after in-memory parsing
- Lets the manager confirm or correct extracted behavioural preferences
- Captures a current leadership challenge and adaptive follow-up answers
- Generates a structured coaching pathway using OpenAI when configured
- Separates facts, assumptions, preference lens, other-person hypotheses and person/process factors
- Builds options, a conversation planner, action plan and follow-up reflection
- Exports a branded PDF coaching report
- Provides a secure admin dashboard and privacy-safe CSV export
- Stores production data in PostgreSQL through Prisma

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

For local development without PostgreSQL, omit `DATABASE_URL`. The app uses a local JSON file store at `.data/coach-sessions.json`.

## Production Setup

See `DEPLOYMENT.md`.

## Admin Password

Generate a bcrypt hash:

```bash
pnpm hash-password
```

Set `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` in the hosting environment.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

## Admin Architecture

See `ARCHITECTURE.md` for the decision on Manager Coach admin integration with the existing TCW Team Performance app.

## Important Privacy Note

Do not commit real Insights reports, production exports, production database URLs, API keys or admin hashes. The parser tests and browser tests use synthetic content only.
