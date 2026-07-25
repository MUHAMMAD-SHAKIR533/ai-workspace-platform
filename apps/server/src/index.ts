import "dotenv/config";
import http from "node:http";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";
import { authSchemas, clientSchema, projectSchema, taskSchema } from "@synthetix/shared";

const db = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.WEB_ORIGIN || "http://localhost:3000", credentials: true },
});
const port = Number(process.env.API_PORT || 4000);
const accessSecret = process.env.JWT_ACCESS_SECRET || "development-only-secret-change-me";
type AuthedRequest = Request & { user?: { id: string; roles: string[] } };
const safeUser = (u: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: { role: { name: string } }[];
}) => ({
  id: u.id,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName,
  roles: u.roles?.map((x) => x.role.name) || [],
});
const fail = (status: number, code: string, message: string, fields?: Record<string, string>) =>
  Object.assign(new Error(message), { status, code, fields });
app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api/v1/auth", rateLimit({ windowMs: 15 * 60_000, limit: 100 }));
const auth = async (req: AuthedRequest, _res: Response, next: NextFunction) => {
  try {
    const raw = req.headers.authorization?.replace("Bearer ", "");
    if (!raw) throw fail(401, "UNAUTHENTICATED", "Authentication is required");
    const data = jwt.verify(raw, accessSecret) as { sub: string };
    const user = await db.user.findUnique({ where: { id: data.sub }, include: { roles: { include: { role: true } } } });
    if (!user || user.status !== "ACTIVE") throw fail(401, "UNAUTHENTICATED", "Session is invalid");
    req.user = { id: user.id, roles: user.roles.map((r: { role: { name: string } }) => r.role.name) };
    next();
  } catch (e) {
    next(e);
  }
};
const roles =
  (...allowed: string[]) =>
  (req: AuthedRequest, _res: Response, next: NextFunction) =>
    req.user?.roles.some((r) => allowed.includes(r))
      ? next()
      : next(fail(403, "FORBIDDEN", "You do not have permission for this action"));
const page = (req: Request) => ({
  skip: Math.max(0, Number(req.query.offset || 0)),
  take: Math.min(100, Math.max(1, Number(req.query.limit || 20))),
});
app.get("/health", (_q, r) => r.json({ status: "ok", service: "synthetix-api" }));
app.post("/api/v1/auth/signup", async (req, res, next) => {
  try {
    const data = authSchemas.signup.parse(req.body);
    const exists = await db.user.findUnique({ where: { email: data.email } });
    if (exists) throw fail(409, "EMAIL_EXISTS", "An account already uses this email");
    const role = await db.role.upsert({ where: { name: "EMPLOYEE" }, update: {}, create: { name: "EMPLOYEE" } });
    const user = await db.user.create({
      data: { ...data, passwordHash: await bcrypt.hash(data.password, 12), roles: { create: { roleId: role.id } } },
      include: { roles: { include: { role: true } } },
    });
    const accessToken = jwt.sign({ sub: user.id }, accessSecret, { expiresIn: "15m" });
    res.status(201).json({ user: safeUser(user), accessToken });
  } catch (error) {
    next(error);
  }
});
app.post("/api/v1/auth/login", async (req, res, next) => {
  try {
    const data = authSchemas.login.parse(req.body);
    const user = await db.user.findUnique({
      where: { email: data.email },
      include: { roles: { include: { role: true } } },
    });
    if (!user || !user.passwordHash || !(await bcrypt.compare(data.password, user.passwordHash)))
      throw fail(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
    res.json({ user: safeUser(user), accessToken: jwt.sign({ sub: user.id }, accessSecret, { expiresIn: "15m" }) });
  } catch (e) {
    next(e);
  }
});
app.get("/api/v1/users/me", auth, async (req: AuthedRequest, res, next) => {
  try {
    const user = await db.user.findUniqueOrThrow({
      where: { id: req.user!.id },
      include: { roles: { include: { role: true } } },
    });
    res.json({ user: safeUser(user) });
  } catch (e) {
    next(e);
  }
});
app.get("/api/v1/dashboard/summary", auth, async (_req, res, next) => {
  try {
    const [projects, tasks, clients, people] = await Promise.all([
      db.project.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      db.task.count({ where: { status: { not: "DONE" } } }),
      db.client.count({ where: { status: "ACTIVE" } }),
      db.user.count({ where: { status: "ACTIVE" } }),
    ]);
    res.json({
      kpis: [
        { label: "Active projects", value: projects, trend: "+12.5%", tone: "primary" },
        { label: "Open tasks", value: tasks, trend: "4 overdue", tone: "warning" },
        {
          label: "Team utilization",
          value: `${Math.min(98, people * 12 + 36)}%`,
          trend: `${people} active members`,
          tone: "success",
        },
        { label: "Active clients", value: clients, trend: "Healthy portfolio", tone: "primary" },
      ],
      insights: [
        "Delivery velocity increased 18% compared with the prior period.",
        "Review tasks due this week to protect your delivery forecast.",
      ],
      activity: [
        "Atlas Intelligence moved into active delivery",
        "Analytics command center assigned to MUHAMAD SHAKIR",
        "Northstar Labs project health updated",
      ],
    });
  } catch (e) {
    next(e);
  }
});
app.get("/api/v1/projects", auth, async (req, res, next) => {
  try {
    const { skip, take } = page(req);
    const where = { deletedAt: null, name: { contains: String(req.query.search || ""), mode: "insensitive" as const } };
    const [data, total] = await db.$transaction([
      db.project.findMany({
        where,
        skip,
        take,
        include: { client: true, team: true, _count: { select: { tasks: true } } },
        orderBy: { updatedAt: "desc" },
      }),
      db.project.count({ where }),
    ]);
    res.json({ data, total, offset: skip, limit: take });
  } catch (e) {
    next(e);
  }
});
app.post("/api/v1/projects", auth, roles("ADMIN", "MANAGER"), async (req: AuthedRequest, res, next) => {
  try {
    const data = projectSchema.parse(req.body);
    const project = await db.project.create({ data: { ...data, createdById: req.user!.id } });
    io.emit("activity:new", { action: "project.created", entityId: project.id });
    res.status(201).json({ data: project });
  } catch (e) {
    next(e);
  }
});
app.get("/api/v1/projects/:id", auth, async (req, res, next) => {
  try {
    res.json({
      data: await db.project.findUniqueOrThrow({
        where: { id: req.params.id },
        include: { client: true, team: true, tasks: { include: { assignee: true } } },
      }),
    });
  } catch (e) {
    next(e);
  }
});
app.patch("/api/v1/projects/:id", auth, roles("ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    const existing = await db.project.findUniqueOrThrow({ where: { id: req.params.id } });
    const data = projectSchema.parse({ ...existing, ...req.body });
    res.json({ data: await db.project.update({ where: { id: req.params.id }, data }) });
  } catch (e) {
    next(e);
  }
});
app.get("/api/v1/tasks", auth, async (req: AuthedRequest, res, next) => {
  try {
    const { skip, take } = page(req);
    const mine = req.query.mine === "true" ? { assigneeId: req.user!.id } : {};
    const [data, total] = await db.$transaction([
      db.task.findMany({
        where: mine,
        skip,
        take,
        include: { project: true, assignee: true },
        orderBy: { dueDate: "asc" },
      }),
      db.task.count({ where: mine }),
    ]);
    res.json({ data, total, offset: skip, limit: take });
  } catch (e) {
    next(e);
  }
});
app.post("/api/v1/tasks", auth, roles("ADMIN", "MANAGER"), async (req: AuthedRequest, res, next) => {
  try {
    res
      .status(201)
      .json({ data: await db.task.create({ data: { ...taskSchema.parse(req.body), createdById: req.user!.id } }) });
  } catch (e) {
    next(e);
  }
});
app.patch("/api/v1/tasks/:id", auth, async (req: AuthedRequest, res, next) => {
  try {
    const old = await db.task.findUniqueOrThrow({ where: { id: req.params.id } });
    if (!req.user!.roles.some((r) => ["ADMIN", "MANAGER"].includes(r)) && old.assigneeId !== req.user!.id)
      throw fail(403, "FORBIDDEN", "Only the assignee can update this task");
    res.json({ data: await db.task.update({ where: { id: old.id }, data: taskSchema.partial().parse(req.body) }) });
  } catch (e) {
    next(e);
  }
});
app.get("/api/v1/clients", auth, async (req, res, next) => {
  try {
    res.json({
      data: await db.client.findMany({
        include: { _count: { select: { projects: true } } },
        orderBy: { createdAt: "desc" },
      }),
    });
  } catch (e) {
    next(e);
  }
});
app.post("/api/v1/clients", auth, roles("ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    res.status(201).json({ data: await db.client.create({ data: clientSchema.parse(req.body) }) });
  } catch (e) {
    next(e);
  }
});
for (const route of [
  "teams",
  "employees",
  "documents",
  "meetings",
  "notifications",
  "channels",
  "admin/users",
  "admin/roles",
  "admin/audit-logs",
]) {
  app.get(`/api/v1/${route}`, auth, async (_q, res) => res.json({ data: [], total: 0 }));
}
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const e = err as {
    status?: number;
    code?: string;
    message?: string;
    issues?: { path: (string | number)[]; message: string }[];
  };
  const fields = e.issues ? Object.fromEntries(e.issues.map((i) => [i.path.join("."), i.message])) : undefined;
  res
    .status(e.status || 400)
    .json({
      error: { code: e.code || "VALIDATION_ERROR", message: e.message || "Request could not be processed", fields },
    });
});
io.on("connection", (socket) => socket.emit("presence:update", { connected: true }));
server.listen(port, () => console.log(`Synthetix API listening on ${port}`));
