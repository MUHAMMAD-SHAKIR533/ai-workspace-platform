# Deployment

Deploy `apps/web` to Vercel and `apps/server` to Railway or Render. Provide each platform the relevant environment variables from `.env.example`; set `WEB_ORIGIN` to the deployed frontend URL and set `NEXT_PUBLIC_API_URL` to the deployed API URL. Provision Neon PostgreSQL and run `npx prisma migrate deploy` during a reviewed release. For horizontal Socket.IO scale-out, configure a managed Redis adapter.
