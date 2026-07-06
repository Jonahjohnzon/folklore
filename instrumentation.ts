// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startRecommendationCron } = await import("@/lib/cron/scheduler");
    startRecommendationCron();
  }
}