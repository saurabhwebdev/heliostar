import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db/prisma";

// GET: list routes; POST: add route for a user (admin only)
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  type SessionUser = { role?: string };
  if (!session?.user || (session.user as SessionUser).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const userId = params.id;
  const items = await prisma.routeAccess.findMany({ where: { userId }, orderBy: { path: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  type SessionUser = { role?: string };
  if (!session?.user || (session.user as SessionUser).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const userId = params.id;
  const body = await request.json().catch(() => null) as null | { path?: string; isPrefix?: boolean };
  if (!body || !body.path) return NextResponse.json({ error: "Missing path" }, { status: 400 });
  const path = body.path.trim();
  const isPrefix = Boolean(body.isPrefix ?? true);
  const created = await prisma.routeAccess.upsert({
    where: { userId_path: { userId, path } },
    update: { isPrefix },
    create: { userId, path, isPrefix },
  });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
