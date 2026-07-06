import type { NextRequest } from "next/server";
import { getAuthCookie } from "./cookies";
import { verifyAuthToken, type AuthTokenPayload } from "./jwt";
import { UnauthorizedError } from "../lib/db/errors";
import { fail } from "../response";

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
      (req as AuthedRequest).user = payload;

      return handler(req as AuthedRequest, ctx);
    } catch {
      return fail(new UnauthorizedError("Invalid or expired session"));
    }
  };
}