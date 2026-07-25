# Project structure

- `apps/web` — Next.js App Router frontend and responsive enterprise UI.
- `apps/server` — Express API, security middleware, Prisma access, and Socket.IO.
- `packages/shared` — shared Zod schemas and role/status constants.
- `prisma` — canonical database schema and seed location.

The server follows middleware → route/controller-style handlers → Prisma access. UI shared components remain in `apps/web/components`; all section pages share the same responsive shell.
