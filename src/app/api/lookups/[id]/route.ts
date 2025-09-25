import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db/prisma";

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  type SessionUser = { role?: string };
  if (!session?.user || (session.user as SessionUser).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.lookupItem.delete({ where: { id } }).catch(async () => {
    // Fall back to soft-deactivate if hard delete fails
    await prisma.lookupItem.update({ where: { id }, data: { active: false } });
  });
  return NextResponse.json({ ok: true });
}
