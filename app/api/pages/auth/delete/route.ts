import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { withAuth } from "@/app/api/auth/withAuth";
import { ok, fail } from "@/app/api/response";
import { NotFoundError } from "@/app/api/lib/db/errors";
import { cookies } from "next/headers";

export const DELETE = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const userId = req.user.sub;
    const user = await User.findByIdAndUpdate(userId, {
      status: "deleted",
      email: `deleted_${userId}@deleted.local`,
    });
    if (!user) throw new NotFoundError("User not found");

    const cookieStore = await cookies();
    cookieStore.delete("token"); // confirm this matches your actual cookie name in cookies.ts

    return ok({ deleted: true });
  } catch (err) {
    return fail(err);
  }
});