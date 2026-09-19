# Architecture

## Admin Integration Decision

The existing TCW Team Performance Indicator repository implements its admin dashboard inside that app. It uses app-local routes, app-local Prisma models, a dedicated signed admin cookie and a dashboard that knows only about Team Performance assessment records.

Directly integrating Manager Coach into that dashboard from this repository is not viable without creating a fragile cross-repository dependency. Manager Coach would either need to write into another app's database schema or the Team Performance app would need new deployment and schema changes. That would make releases coupled and increase privacy risk.

The least-fragmented production architecture implemented here is:

- Manager Coach has its own app-local admin, matching the Team Performance admin pattern.
- Session, coaching and analytics data are normalized in PostgreSQL through Prisma.
- Admin export is intentionally privacy-safe and excludes sensitive challenge/coaching/reflection payloads.
- The repository is ready for a future central TCW Admin/Data service by keeping session records and analytics events normalized, app-labelled by route/documentation, and protected behind the same admin environment contract.

Recommended next step for a single TCW dashboard: create a dedicated TCW Admin app or shared admin service that reads approved reporting views from each product database, rather than letting one product reach directly into another product's tables.

## Runtime Shape

- Next.js App Router, React and TypeScript.
- PostgreSQL with Prisma in production.
- Local JSON file store only when `DATABASE_URL` is absent or `E2E_IN_MEMORY=1`, so the app can be verified locally without database setup.
- Server-side signed admin cookie using `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`.
- OpenAI Responses API structured output for coaching plans when `OPENAI_API_KEY` is set.
- Deterministic rules-backed coaching fallback for local development, tests and OpenAI failures.

## Privacy Controls

- PDF upload accepts only PDF files and enforces a configurable size limit.
- PDF bytes are parsed in memory; the app stores only the extracted/confirmed behavioural summary.
- The raw PDF text is not persisted.
- Analytics events allow only operational metadata keys.
- Admin CSV excludes session token, challenge text, coaching text, action notes and reflection text.

## Key Data Models

- `CoachSession`: participant metadata, private token, confirmed behavioural context, challenge, coaching plan, action plan and reflection.
- `AnalyticsEvent`: event type, stage and privacy-safe metadata only.
