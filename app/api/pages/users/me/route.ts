import { withAuth } from "@/app/api/auth/withAuth";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { User } from "@/app/api/lib/models/User";
import { updateUserSchema } from "@/app/api/validation/user.schema";
import { ok, fail } from "@/app/api/response";
import { ValidationError, NotFoundError } from "@/app/api/lib/db/errors";
import { cloudinary } from "@/app/api/lib/cloudinary";

export const PATCH = withAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.flatten().fieldErrors);
    }
    const {avatarPublicId} = parsed.data
    if(avatarPublicId)
      {
         const userinfo = await User.findById(req.user.sub).select("avatarPublicId");
         const oldPublicId = userinfo?.avatarPublicId;
         if(oldPublicId && oldPublicId !== avatarPublicId)
          {
            cloudinary.uploader.destroy(oldPublicId).catch((err) => {
            console.error("Failed to delete old avatar from Cloudinary:", err);
          });
          }

      }

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $set: parsed.data },
      { new: true }
    );

    if (!user) throw new NotFoundError("User not found");

    const { passwordHash, ...safeUser } = user.toObject();
    return ok({ user: safeUser });
  } catch (error) {
    return fail(error);
  }
});