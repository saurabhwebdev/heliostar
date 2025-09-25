import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "10");
  const items = await prisma.capa.findMany({
    orderBy: { createdAt: "desc" },
    take: Number.isFinite(limit) && limit > 0 ? limit : 10,
    include: {
      incident: true,
      assignedTo: { select: { id: true, username: true, name: true } },
    },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as null | Record<string, unknown>;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const incidentId = String(body.incidentId || "");
  const assignedToId = body.assignedToId ? String(body.assignedToId) : null;
  const costAmount = body.costAmount != null && body.costAmount !== "" ? Number(body.costAmount) : null;
  const costCurrency = body.costCurrency ? String(body.costCurrency) : null;
  const description = String(body.description || "");
  const actionTaken = String(body.actionTaken || "");

  if (!incidentId || !description || !actionTaken) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Load incident snapshot fields
  const inc = await prisma.incident.findUnique({ where: { id: incidentId } });
  if (!inc) return NextResponse.json({ error: "Incident not found" }, { status: 404 });

  const created = await prisma.capa.create({
    data: {
      incidentId,
      assignedToId,
      site: inc.site,
      occurredAt: inc.occurredAt,
      incidentArea: inc.incidentArea,
      incidentCategory: inc.incidentCategory,
      shift: inc.shift,
      severity: inc.severity,
      personnelType: inc.personnelType,
      operationalCategory: inc.operationalCategory,
      description,
      actionTaken,
      costAmount,
      costCurrency,
    },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
