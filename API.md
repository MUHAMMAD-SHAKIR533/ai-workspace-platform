# API

All API routes are under `/api/v1`; authenticated routes accept `Authorization: Bearer <accessToken>`. Errors use `{ "error": { "code", "message", "fields?" } }`.

Implemented endpoints include `POST /auth/signup`, `POST /auth/login`, `GET /users/me`, `GET /dashboard/summary`, project and task CRUD routes, client routes, and collection endpoints for teams, employees, documents, meetings, notifications, channels, and admin resources. `GET /health` is unauthenticated.

Roles are `ADMIN`, `MANAGER`, `EMPLOYEE`, and `CLIENT`. Project/client creation requires Admin or Manager; a task can be updated by its assignee or a privileged role.
