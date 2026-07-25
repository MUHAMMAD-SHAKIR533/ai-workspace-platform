# Installation

Install Node.js LTS and npm. Create a Neon database, copy `.env.example` to `.env`, and set `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` to secure values. Then run:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

The seeded administrator is `admin@synthetix.dev` with password `Welcome123`; change it immediately in any non-demo environment. No Docker, local PostgreSQL, or local Redis is required.
