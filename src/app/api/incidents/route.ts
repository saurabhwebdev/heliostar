import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/db/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "10");
  const items = await prisma.incident.findMany({
    orderBy: { createdAt: "desc" },
    take: Number.isFinite(limit) && limit > 0 ? limit : 10,
    include: { reporter: { select: { id: true, username: true, name: true, email: true } } },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  // Expecting a shape from the client similar to the form fields
  const {
    site,
    dateISO,
    time,
    incidentArea,
    incidentCategory,
    shift,
    severidad,
    tipoPersonal,
    injuryArea,
    categoriaOperativa,
    description,
    riskScore,
  } = body as Record<string, unknown>;

  if (!site || !dateISO || !time || !incidentArea || !incidentCategory || !shift || !severidad || !tipoPersonal || !injuryArea || !categoriaOperativa || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Build occurredAt as YYYY-MM-DD + time (server local time)
  const datePart = String(dateISO).slice(0, 10);
  const occurredAtStr = `${datePart}T${String(time)}:00`;
  const occurredAt = new Date(occurredAtStr);

  const created = await prisma.incident.create({
    data: {
      reporterId: (session.user as any).id,
      site: String(site),
      occurredAt,
      incidentArea: String(incidentArea),
      incidentCategory: String(incidentCategory),
      shift: String(shift),
      severity: String(severidad),
      personnelType: String(tipoPersonal),
      injuryArea: String(injuryArea),
      operationalCategory: String(categoriaOperativa),
      description: String(description),
      riskScore: riskScore != null ? Number(riskScore) : null,
    },
  });
  return NextResponse.json({ id: created.id }, { status: 201 });
}
