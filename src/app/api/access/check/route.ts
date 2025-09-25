import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db/prisma";

// GET /api/access/check?path=/dashboard/capa
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ allowed: false }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const path = String(searchParams.get("path") || "");
  if (!path) return NextResponse.json({ allowed: false }, { status: 400 });

  const role = (session.user as any).role;
  if (role === "ADMIN") return NextResponse.json({ allowed: true });

  const userId = (session.user as any).id as string;
  const routes = await prisma.routeAccess.findMany({ where: { userId } });
  const allowed = routes.some((r) => (r.isPrefix ? path.startsWith(r.path) : path === r.path));
  return NextResponse.json({ allowed });
}
