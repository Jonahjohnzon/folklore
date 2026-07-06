// lib/cron/scheduler.ts
import cron from "node-cron";
import { generateAllRecommendations } from "@/lib/algo/generateRecommendations";
import { sendReadingReminders } from "@/lib/notifications/sendReadingReminders";

let started = false;

export function startRecommendationCron() {
  if (started) return; // prevent double-registration on hot reload
  started = true;

  // every 30 min while developing — tighten/loosen as you like
  cron.schedule("*/30 * * * *", async () => {
    console.log("[cron] generating recommendations...");
    try {
      const result = await generateAllRecommendations();
      console.log("[cron] done:", result);
    } catch (err) {
      console.error("[cron] failed:", err);
    }
  });

  cron.schedule("0 18 * * *", async () => { // once daily, 6pm — don't spam multiple times a day
  console.log("[cron] sending reading reminders...");
  try {
    const result = await sendReadingReminders();
    console.log("[cron] done:", result);
  } catch (err) {
    console.error("[cron] failed:", err);
  }
});
}