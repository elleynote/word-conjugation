import { NextRequest, NextResponse } from "next/server";
import { generateVerbCandidate, openAiFallbackConfigured, openAiVerbModel } from "@/lib/server/openaiVerbFallback";
import { findVerifiedVerb, storeAiCandidate } from "@/lib/server/verbRepository";
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

  if (!openAiFallbackConfigured()) {
    return NextResponse.json({ verb: null, source: null, verified: false }, { status: 404 });
  }

  try {
    const candidate = await generateVerbCandidate(query, dialect);
    if (!candidate) {
      return NextResponse.json({ verb: null, source: null, verified: false }, { status: 404 });
    }

    const model = openAiVerbModel();
    try {
      await storeAiCandidate(query, dialect, candidate, model);
    } catch (error) {
      console.error("Unable to store AI candidate in Supabase.", error);
    }

    return NextResponse.json({ verb: candidate, source: "ai", verified: false, model });
  } catch (error) {
    console.error("OpenAI verb fallback failed.", error);
    return NextResponse.json({ verb: null, source: null, verified: false }, { status: 502 });
  }
}
