import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin", 10);
  const userPasswordHash = await bcrypt.hash("user", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      email: "admin@example.local",
      name: "Admin",
    },
    create: {
      username: "admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      email: "admin@example.local",
      name: "Admin",
    },
  });

  await prisma.user.upsert({
    where: { username: "user" },
    update: {
      passwordHash: userPasswordHash,
      role: "USER",
      email: "user@example.local",
      name: "User",
    },
    create: {
      username: "user",
      passwordHash: userPasswordHash,
      role: "USER",
      email: "user@example.local",
      name: "User",
    },
  });

  // Seed lookup items for Report Incident dropdowns
  const seed = async (type: string, items: Array<{ value: string; label: string; order?: number }>) => {
    for (const it of items) {
      await prisma.lookupItem.upsert({
        where: { type_value: { type, value: it.value } },
        update: { label: it.label, order: it.order ?? null, active: true },
        create: { type, value: it.value, label: it.label, order: it.order ?? null },
      });
    }
  };

  await seed("site", [
    { value: "plant-a", label: "Plant A", order: 1 },
    { value: "plant-b", label: "Plant B", order: 2 },
    { value: "warehouse", label: "Warehouse", order: 3 },
    { value: "office", label: "Office", order: 4 },
  ]);
  await seed("incidentArea", [
    { value: "production", label: "Production" },
    { value: "maintenance", label: "Maintenance" },
    { value: "warehouse", label: "Warehouse" },
    { value: "office", label: "Office" },
    { value: "outdoors", label: "Outdoors" },
  ]);
  await seed("incidentCategory", [
    { value: "near-miss", label: "Near miss" },
    { value: "first-aid", label: "First aid" },
    { value: "medical", label: "Medical" },
    { value: "lost-time", label: "Lost time" },
    { value: "property", label: "Property damage" },
  ]);
  await seed("shift", [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "night", label: "Night" },
  ]);
  await seed("severity", [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ]);
  await seed("personnelType", [
    { value: "empleado", label: "Employee" },
    { value: "contratista", label: "Contractor" },
    { value: "visitante", label: "Visitor" },
  ]);
  await seed("injuryArea", [
    { value: "head", label: "Head" },
    { value: "hand", label: "Hand" },
    { value: "arm", label: "Arm" },
    { value: "leg", label: "Leg" },
    { value: "back", label: "Back" },
    { value: "other", label: "Other" },
  ]);
  await seed("operationalCategory", [
    { value: "mechanical", label: "Mechanical" },
    { value: "electrical", label: "Electrical" },
    { value: "chemical", label: "Chemical" },
    { value: "ergonomic", label: "Ergonomic" },
    { value: "safety", label: "Safety" },
    { value: "environmental", label: "Environmental" },
  ]);
  await seed("currency", [
    { value: "USD", label: "USD ($)", order: 1 },
    { value: "EUR", label: "EUR (€)", order: 2 },
    { value: "MXN", label: "MXN ($)", order: 3 },
    { value: "INR", label: "INR (₹)", order: 4 },
    { value: "GBP", label: "GBP (£)", order: 5 },
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
