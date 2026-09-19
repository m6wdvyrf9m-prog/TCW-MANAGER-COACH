# Deployment

## Required Production Services

1. PostgreSQL database.
2. OpenAI API key for structured coaching generation.
3. A secure hosting platform that supports Next.js with Node.js runtime routes.
4. Strong admin credentials.

## Environment Variables

Copy `.env.example` to `.env.local` for local setup. Configure these in production:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/tcw_manager_coach?schema=public"
NEXT_PUBLIC_APP_URL="https://your-production-domain"
OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="gpt-5-mini"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="bcrypt-hash-from-pnpm-hash-password"
ADMIN_SESSION_SECRET="at-least-32-random-characters"
PDF_MAX_UPLOAD_MB="10"
```

Generate the admin password hash:

```bash
pnpm hash-password
```

## Database

For local PostgreSQL development:

```bash
pnpm db:dev
```

For production:

```bash
pnpm db:migrate
```

## Build

```bash
pnpm install
pnpm check
```

## Deployment Status

This repository includes deployment-ready configuration, migrations and documentation. It has not been deployed from this workspace because production secrets, the PostgreSQL database URL and the final production hosting target must be provided outside the repository.

## Routes

- `/` - start a private Manager Coach session
- `/coach/[token]` - persistent participant coaching workspace
- `/coach/[token]/pdf` - branded coaching PDF export
- `/privacy` - privacy notice
- `/admin/login` - secure admin login
- `/admin` - admin dashboard
- `/admin/logout` - admin sign out
- `/api/sessions` - create session
- `/api/sessions/[token]/upload` - secure PDF upload and extraction
- `/api/sessions/[token]/profile` - confirm behavioural context
- `/api/sessions/[token]/challenge` - save challenge and generate coaching pathway
- `/api/sessions/[token]/action-plan` - save selected actions
- `/api/sessions/[token]/reflection` - save follow-up reflection
- `/api/admin/export` - privacy-safe admin CSV
