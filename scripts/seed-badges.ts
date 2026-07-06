import { config } from "dotenv";
config({ path: ".env.local" });

import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Badge } from "@/app/api/lib/models/Badge";
import { BADGE_DEFS } from "@/lib/badges/definitions";

async function seed() {
  await connectToDatabase();
  for (const def of BADGE_DEFS) {
    await Badge.updateOne(
      { key: def.key },
      { $setOnInsert: { ...def, active: true } },
      { upsert: true }
    );
  }
  console.log(`Seeded ${BADGE_DEFS.length} badges.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});