import { NextRequest, NextResponse } from "next/server";
import { findVerifiedVerb } from "@/lib/server/verbRepository";
import type { Dialect } from "@/types/verb";

export const dynamic = "force-dynamic";

function parseDialect(value: string | null): Dialect {
  return value === "eastern" ? "eastern" : "western";
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const dialect = parseDialect(request.nextUrl.searchParams.get("dialect"));

  if (!query) {
    return NextResponse.json({ error: "A verb query is required." }, { status: 400 });
  }

  const verified = await findVerifiedVerb(query, dialect);
  if (verified) {
    return NextResponse.json({ verb: verified, source: verified.source ?? "local", verified: true });
  }

  return NextResponse.json({ verb: null, source: null, verified: false }, { status: 404 });
}
