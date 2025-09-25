import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db/prisma";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = params.id;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.lookupItem.delete({ where: { id } }).catch(async () => {
    // Fall back to soft-deactivate if hard delete fails
    await prisma.lookupItem.update({ where: { id }, data: { active: false } });
  });
  return NextResponse.json({ ok: true });
}
