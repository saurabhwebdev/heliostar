import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = params.id;
  const body = await request.json().catch(() => null) as null | Record<string, unknown>;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const data: any = {};
  if (typeof body.name === 'string') data.name = body.name || null;
  if (typeof body.email === 'string') data.email = body.email || null;
  if (typeof body.role === 'string') data.role = (String(body.role).toUpperCase() === 'ADMIN') ? 'ADMIN' : 'USER';
  if (typeof body.username === 'string' && body.username.trim()) {
    data.username = String(body.username).trim();
  }
  if (typeof body.password === 'string' && body.password.length > 0) {
    data.passwordHash = await bcrypt.hash(String(body.password), 10);
  }

  try {
    const updated = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = (e as any)?.message || 'Update failed';
    return NextResponse.json({ error: String(msg) }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = params.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  // Prevent self-delete to avoid odd states during admin session
  if ((session.user as any).id === id) {
    return NextResponse.json({ error: "You cannot delete your own account while signed in" }, { status: 400 });
  }
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = (e as any)?.message || 'Delete failed';
    return NextResponse.json({ error: String(msg) }, { status: 400 });
  }
}
