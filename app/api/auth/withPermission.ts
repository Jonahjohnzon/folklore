// app/api/auth/withPermission.ts
import { withAuth, type AuthedRequest, type RouteContext, type WrappedHandler } from "./withAuth";
import { connectToDatabase } from "../lib/db/connect";
import { User } from "../lib/models/User";
import { ForbiddenError, UnauthorizedError } from "../lib/db/errors";
import { fail } from "../response";

// Adjust to whatever roles/flags actually exist on your User model.
// If Lore's User doesn't have a `role` field yet, add one (e.g. "user" | "admin" | "moderator").
type Permission = "admin";

export interface PermissionedRequest extends AuthedRequest {
  role: string;
}

export function withPermission<TParams extends Record<string, string | string[]> = Record<string, string | string[]>>(
  permission: Permission,
  // Was `=> unknown` — that's what let Promise<unknown> leak through this
  // wrapper and out to the exported route handler.
  handler: (req: PermissionedRequest, ctx: RouteContext<TParams>) => Promise<Response>
): WrappedHandler<TParams> {
  return withAuth<TParams>(async (req, ctx) => {
    try {
      await connectToDatabase();

      const user = await User.findById(req.user.sub).select("role").lean();
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      const hasPermission = checkPermission(user.role, permission);
      if (!hasPermission) {
        throw new ForbiddenError("Insufficient permissions");
      }

      (req as PermissionedRequest).role = user.role;

      return handler(req as PermissionedRequest, ctx);
    } catch (error) {
      return fail(error instanceof ForbiddenError || error instanceof UnauthorizedError
        ? error
        : new ForbiddenError("Insufficient permissions"));
    }
  });
}

function checkPermission(role: string, permission: Permission): boolean {
  switch (permission) {
    case "admin":
      return role === "admin";
    default:
      return false;
  }
}