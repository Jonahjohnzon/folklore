import type { NextRequest } from "next/server";
import { getAuthCookie } from "./cookies";
import { verifyAuthToken, type AuthTokenPayload } from "./jwt";
import { UnauthorizedError } from "../lib/db/errors";
import { fail } from "../response";
import { connectToDatabase } from "../lib/db/connect";
import { User } from "../lib/models/User";

export interface AuthedRequest extends NextRequest {
  user: AuthTokenPayload;
}

export type RouteContext<TParams extends Record<string, string | string[]> = Record<string, string | string[]>> = {
  params: Promise<TParams>;
};

// What YOU write: receives the already-authenticated request.
export type AuthHandler<TParams extends Record<string, string | string[]> = Record<string, string | string[]>> = (
  req: AuthedRequest,
  ctx: RouteContext<TParams>
) => Promise<Response>;

// What Next.js actually calls: a plain NextRequest, no `user` yet — that's
// added internally by withAuth before it invokes your handler. Exporting
// withAuth's return type as AuthHandler (my earlier mistake) demanded every
// caller supply a `user` up front, which is impossible since Next.js is the
// one calling this function and has no idea what `user` is.
export type WrappedHandler<TParams extends Record<string, string | string[]> = Record<string, string | string[]>> = (
  req: NextRequest,
  ctx: RouteContext<TParams>
) => Promise<Response>;

export function withAuth<TParams extends Record<string, string | string[]> = Record<string, string | string[]>>(
  handler: AuthHandler<TParams>
): WrappedHandler<TParams> {
  return async (req, ctx) => {
    try {
      const token = await getAuthCookie();
      if (!token) {
        throw new UnauthorizedError("Not authenticated");
      }

      const payload = await verifyAuthToken(token);

      // The JWT only proves who the user was at login time — status can
      // change (suspend, delete) any time within that 7-day window, so it
      // has to be checked fresh against the DB on every request, not read
      // off the token.
      await connectToDatabase();
      const user = await User.findById(payload.sub).select("status").lean();

      if (!user) {
        throw new UnauthorizedError("Account not found");
      }

      if (user.status === "deleted") {
        throw new UnauthorizedError("This account has been deleted");
      }

      if (user.status === "suspended") {
        throw new UnauthorizedError("This account has been suspended");
      }

      if (user.status !== "active") {
        throw new UnauthorizedError("This account is not active");
      }

      (req as AuthedRequest).user = payload;

      return handler(req as AuthedRequest, ctx);
    } catch {
      return fail(new UnauthorizedError("Invalid or expired session"));
    }
  };
}