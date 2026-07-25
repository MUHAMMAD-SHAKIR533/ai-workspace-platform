import { z } from "zod";
export const ROLES = ["ADMIN", "MANAGER", "EMPLOYEE", "CLIENT"] as const;
export type RoleName = (typeof ROLES)[number];
export const PROJECT_STATUSES = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;
export const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const password = z
  .string()
  .min(8)
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number");
export const authSchemas = {
  signup: z.object({
    email: z.string().email(),
    password,
    firstName: z.string().min(1).max(60),
    lastName: z.string().min(1).max(60),
  }),
  login: z.object({ email: z.string().email(), password: z.string().min(1) }),
  reset: z.object({ token: z.string().min(1), newPassword: password }),
};
export const projectSchema = z
  .object({
    name: z.string().min(3).max(120),
    description: z.string().max(5000).optional(),
    status: z.enum(PROJECT_STATUSES).default("PLANNING"),
    priority: z.enum(priorities).default("MEDIUM"),
    startDate: z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),
    teamId: z.string().uuid().optional(),
    clientId: z.string().uuid().optional(),
  })
  .refine((v) => !v.startDate || !v.dueDate || v.dueDate >= v.startDate, {
    message: "Due date must follow start date",
    path: ["dueDate"],
  });
export const taskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(TASK_STATUSES).default("TODO"),
  priority: z.enum(priorities).default("MEDIUM"),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.coerce.date().optional(),
});
export const clientSchema = z.object({
  companyName: z.string().min(1).max(120),
  primaryContactName: z.string().min(1).max(120),
  primaryContactEmail: z.string().email(),
  phone: z.string().max(30).optional(),
});
export const messageSchema = z.object({ channelId: z.string().uuid(), body: z.string().min(1).max(10000) });
export type ApiError = { error: { code: string; message: string; fields?: Record<string, string> } };
