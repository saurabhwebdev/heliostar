import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db/prisma";

// Minimal user list for selects
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await prisma.user.findMany({
    orderBy: { username: "asc" },
    select: { id: true, username: true, name: true }
  });
  return NextResponse.json({ items: users });
}
