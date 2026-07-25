# Database

Prisma uses PostgreSQL through `DATABASE_URL`. The schema models users, roles, permissions, teams, employees, clients, projects, tasks, channels/messages, documents, meetings, notifications, and refresh tokens. UUID primary keys and indices support common filters and ordering. Apply changes exclusively through Prisma migrations:

```bash
npx prisma migrate dev --name descriptive_change
```

Use a Neon branch per development, staging, and production environment.
