import { NextResponse } from "next/server";
import { openAiTtsModel, openAiTtsVoice, speechInstructions, validateSpeechRequest } from "@/lib/server/speech";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const validation = validateSpeechRequest(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Text-to-speech is not configured." }, { status: 503 });
  }

  const payload = validation.value;

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openAiTtsModel(),
        voice: openAiTtsVoice(),
        input: payload.text,
        instructions: speechInstructions(payload.language, payload.dialect),
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      console.error("OpenAI speech generation failed.", response.status, await response.text());
      return NextResponse.json({ error: "Unable to generate speech right now." }, { status: 502 });
    }

    const audio = await response.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Speech endpoint failed.", error);
    return NextResponse.json({ error: "Unable to generate speech right now." }, { status: 502 });
  }
}
