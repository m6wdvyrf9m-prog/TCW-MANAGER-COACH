# TCW Manager Coach Repository Instructions

- Keep The Colour Works Manager Coach production-oriented and privacy-conscious.
- Never commit real Insights Discovery reports, real coaching-session data, production secrets or admin password hashes.
- Uploaded PDFs must be parsed server-side and discarded after extraction.
- Analytics must avoid sensitive profile text, challenge text, generated coaching text and reflection notes.
- Keep TCW coaching/IP configuration in `src/config/coachingFramework.ts` so it can be reviewed without hunting through UI code.
- Use PostgreSQL and Prisma for production persistence; the local file store is only for development and tests.
- Preserve the app-local admin routes until a central TCW admin service exists.
