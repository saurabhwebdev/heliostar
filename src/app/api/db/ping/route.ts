import { NextResponse } from "next/server";
import { getMssqlPool } from "@/lib/db/mssql";

export async function GET() {
  try {
    type PoolLike = { query: (q: string) => Promise<{ recordset: Array<Record<string, unknown>> }> };
    const pool = (await getMssqlPool()) as unknown as PoolLike;
    const result = await pool.query("SELECT 1 AS ok");
    const first = result?.recordset?.[0] as { ok?: number } | undefined;
    const ok = first?.ok === 1;
    return NextResponse.json({ ok });
  } catch (e: unknown) {
    const err = e as { message?: string } | string
    const msg = typeof err === 'string' ? err : err?.message ?? 'Unknown error'
    return NextResponse.json({ ok: false, error: String(msg) }, { status: 500 });
  }
}
