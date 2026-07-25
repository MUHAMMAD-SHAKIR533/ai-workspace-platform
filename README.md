# Synthetix Enterprise

An AI-augmented enterprise operations platform for teams, projects, clients, collaboration, and executive visibility. It follows the Synthetix Enterprise design system: dark-first tonal surfaces, glass navigation, and clearly marked AI insights.

## Screenshots

Add deployed-product screenshots here after configuration.

## Features

- Dashboard analytics, insights, workload, deadlines, and live activity
- Projects, tasks, clients, team directory, documents, messaging, meetings, admin, and settings UI
- Express REST API with JWT authentication, RBAC middleware, Zod validation, rate limiting, Helmet, CORS, and Socket.IO
- Prisma PostgreSQL schema with indexed operational entities

## Quick start

1. Copy `.env.example` to `.env` and provide a Neon `DATABASE_URL`.
2. Run `npm install`, `npx prisma generate`, `npx prisma migrate dev`, and `npm run dev`.
3. Open `http://localhost:3000`. The API health endpoint is `http://localhost:4000/health`.

See [INSTALL.md](INSTALL.md), [API.md](API.md), [DATABASE.md](DATABASE.md), [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md), and [DEPLOYMENT.md](DEPLOYMENT.md).

## Scripts

`npm run dev`, `npm run build`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run db:seed`.

## Stack

Next.js, React, TypeScript, Tailwind design tokens, TanStack Query-ready frontend, Recharts, Express, Prisma, PostgreSQL/Neon, JWT, Socket.IO, Jest.
