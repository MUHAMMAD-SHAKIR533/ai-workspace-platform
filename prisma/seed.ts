import { PrismaClient, ProjectStatus, RoleName, TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const permissions = ["project:create", "project:manage", "client:manage", "user:manage-roles", "audit:view"];
  for (const key of permissions)
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key, description: key.replace(":", " ") } });
  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: { name: RoleName.ADMIN, description: "Full workspace access" },
  });
  const managerRole = await prisma.role.upsert({
    where: { name: RoleName.MANAGER },
    update: {},
    create: { name: RoleName.MANAGER, description: "Team and project management" },
  });
  const employeeRole = await prisma.role.upsert({
    where: { name: RoleName.EMPLOYEE },
    update: {},
    create: { name: RoleName.EMPLOYEE, description: "Member access" },
  });
  const passwordHash = await bcrypt.hash("Synthetix123", 12);
  const users = await Promise.all(
    [
      ["muhammadshakir786rrr@gmail.com", "MUHAMAD", "SHAKIR", adminRole.id],
      ["maya@synthetix.dev", "Maya", "Patel", managerRole.id],
      ["theo@synthetix.dev", "Theo", "Hart", employeeRole.id],
    ].map(async ([email, firstName, lastName, roleId]) =>
      prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, firstName, lastName, passwordHash, isEmailVerified: true, roles: { create: { roleId } } },
      }),
    ),
  );
  const team = await prisma.team.upsert({
    where: { name: "Product Engineering" },
    update: {},
    create: { name: "Product Engineering", description: "Cross-functional product delivery" },
  });
  const client = await prisma.client.upsert({
    where: { companyName: "Northstar Labs" },
    update: {},
    create: {
      companyName: "Northstar Labs",
      primaryContactName: "Jordan Lee",
      primaryContactEmail: "jordan@northstarlabs.example",
    },
  });
  const project = await prisma.project.upsert({
    where: { id: "seed-atlas-project" },
    update: {},
    create: {
      id: "seed-atlas-project",
      name: "Atlas Intelligence",
      status: ProjectStatus.ACTIVE,
      teamId: team.id,
      clientId: client.id,
      createdById: users[0].id,
      dueDate: new Date("2026-09-30"),
    },
  });
  await prisma.task.upsert({
    where: { id: "seed-analytics-task" },
    update: {},
    create: {
      id: "seed-analytics-task",
      title: "Ship analytics command center",
      status: TaskStatus.IN_PROGRESS,
      projectId: project.id,
      assigneeId: users[0].id,
      createdById: users[1].id,
      dueDate: new Date("2026-08-06"),
    },
  });
  console.log("Seeded Synthetix demo workspace. Sign in with muhammadshakir786rrr@gmail.com / Synthetix123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
