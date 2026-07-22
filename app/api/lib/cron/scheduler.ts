// lib/cron/scheduler.ts
import cron from "node-cron";
import { generateAllRecommendations } from "@/app/api/lib/algo/generateRecommendations";
import { sendReadingReminders } from "@/app/api/lib/notifications/sendReadingReminders";

let started = false;

export function startRecommendationCron() {
  if (started) return; 
  started = true;

  cron.schedule("*/30 * * * *", async () => {
    try {
      await generateAllRecommendations();
    } catch (err) {
      console.error("[cron] failed:", err);
    }
  });

//   cron.schedule("0 18 * * *", async () => { // once daily, 6pm — don't spam multiple times a day
//   try {
//      await sendReadingReminders();
//   } catch (err) {
//     console.error("[cron] failed:", err);
//   }
// });
}