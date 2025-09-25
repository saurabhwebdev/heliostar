import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db/prisma";

// GET /api/lookups?type=site or /api/lookups?types=site,incidentArea
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const types = searchParams.get("types");

  if (type) {
    const items = await prisma.lookupItem.findMany({
      where: { type, active: true },
      orderBy: [{ order: "asc" }, { label: "asc" }],
    });
    return NextResponse.json({ type, items });
  }

  if (types) {
    const list = types.split(",").map((s) => s.trim()).filter(Boolean);
    const all = await prisma.lookupItem.findMany({
      where: { type: { in: list }, active: true },
      orderBy: [{ type: "asc" }, { order: "asc" }, { label: "asc" }],
    });
    const grouped: Record<string, unknown[]> = {};
    for (const it of all) {
      if (!grouped[it.type]) grouped[it.type] = [];
      grouped[it.type].push(it);
    }
    return NextResponse.json({ items: grouped });
  }

  const all = await prisma.lookupItem.findMany({
    orderBy: [{ type: "asc" }, { order: "asc" }, { label: "asc" }],
  });
  return NextResponse.json({ items: all });
}

// POST /api/lookups (admin only)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  type SessionUser = { role?: string };
  if (!session?.user || (session.user as SessionUser).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const { type, value, label, order, active } = body as Record<string, unknown>;
  if (!type || !value || !label) {
    return NextResponse.json({ error: "Missing type/value/label" }, { status: 400 });
  }
  const item = await prisma.lookupItem.upsert({
    where: { type_value: { type: String(type), value: String(value) } },
    update: { label: String(label), order: order != null ? Number(order) : null, active: active == null ? true : Boolean(active) },
    create: { type: String(type), value: String(value), label: String(label), order: order != null ? Number(order) : null, active: active == null ? true : Boolean(active) },
  });
  return NextResponse.json({ id: item.id }, { status: 201 });
}
