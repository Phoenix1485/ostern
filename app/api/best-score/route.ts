import { NextResponse } from "next/server";

import { readBestScore, saveBestScore } from "@/lib/best-score-store";

export const dynamic = "force-dynamic";

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  try {
    const bestScore = await readBestScore();

    return NextResponse.json({ bestScore });
  } catch {
    return NextResponse.json(
      { error: "Der Server-Bestwert konnte nicht geladen werden." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const rawClicks = body.clicks;

    const clicks =
      typeof rawClicks === "number" ? rawClicks : Number.parseInt(String(rawClicks), 10);

    if (!Number.isInteger(clicks) || clicks < 1) {
      return badRequest("Die Klickzahl ist ungültig.");
    }

    const result = await saveBestScore(clicks);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Der Bestwert konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }
}
