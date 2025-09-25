import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

// GET /api/admin/users (admin only)
export async function GET() {
  const session = await getServerSession(authOptions);
  type SessionUser = { role?: string };
  if (!session?.user || (session.user as SessionUser).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { username: "asc" },
    select: { id: true, username: true, name: true, email: true, role: true }
  });
  return NextResponse.json({ items: users });
}

// POST /api/admin/users (admin only)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  type SessionUser = { role?: string };
  if (!session?.user || (session.user as SessionUser).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => null) as null | Record<string, unknown>;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const name = body.name ? String(body.name) : null;
  const email = body.email ? String(body.email) : null;
  const role = (String(body.role || "USER").toUpperCase() === "ADMIN") ? "ADMIN" : "USER";

  if (!username || !password) {
    return NextResponse.json({ error: "username and password are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "username already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await prisma.user.create({
    data: { username, passwordHash, role, name, email }
  });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
