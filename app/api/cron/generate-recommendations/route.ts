// app/api/cron/generate-recommendations/route.ts
import { NextResponse } from "next/server";
import { generateAllRecommendations } from "@/app/api/lib/algo/generateRecommendations";

export const maxDuration = 60; // adjust based on your plan — see note below

export async function GET(req: Request) {
  // Protects this route from being triggered by randoms hitting the URL directly
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await generateAllRecommendations();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron] generate-recommendations failed:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}