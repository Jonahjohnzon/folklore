// app/api/recommendations/generate/route.ts
// Cron-triggered batch job — NOT meant to be called by the browser.
// Protect with a shared secret so it can't be hit publicly and used to
// hammer the DB with the full aggregation on demand.
import { generateAllRecommendations } from "@/app/api/lib/algo/generateRecommendations";
import { ok, fail } from "@/app/api/response";

export const POST = async (req: Request) => {
  try {
    const secret = req.headers.get("x-cron-secret");
    if (secret !== process.env.CRON_SECRET) {
      return fail({ message: "Unauthorized", status: 401 });
    }
    const result = await generateAllRecommendations();
    return ok(result);
  } catch (error) {
    return fail(error);
  }
};