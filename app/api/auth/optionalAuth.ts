import type { NextRequest } from "next/server";
import { getAuthCookie } from "./cookies";
import { verifyAuthToken, type AuthTokenPayload } from "./jwt";
import { fail } from "../response";

export interface OptionallyAuthedRequest extends NextRequest {
  user: AuthTokenPayload | null;
}

export type RouteContext<TParams extends Record<string, string | string[]> = Record<string, string | string[]>> = {
  params: Promise<TParams>;
};

// What YOU write: receives the request with `user` already resolved (or null).
export type OptionalAuthHandler<TParams extends Record<string, string | string[]> = Record<string, string | string[]>> = (
  req: OptionallyAuthedRequest,
  ctx: RouteContext<TParams>
) => Promise<Response>;

// What Next.js actually calls — same reasoning as withAuth.ts's WrappedHandler.
export type WrappedHandler<TParams extends Record<string, string | string[]> = Record<string, string | string[]>> = (
  req: NextRequest,
  ctx: RouteContext<TParams>
) => Promise<Response>;

export function optionalAuth<TParams extends Record<string, string | string[]> = Record<string, string | string[]>>(
  handler: OptionalAuthHandler<TParams>
): WrappedHandler<TParams> {
  return async (req, ctx) => {
    try {
      const token = await getAuthCookie();
      let user: AuthTokenPayload | null = null;
      if (token) {
        try {
          user = await verifyAuthToken(token);
        } catch {
          // invalid/expired token — treat as anonymous rather than failing the request
          user = null;
        }
      }

      (req as OptionallyAuthedRequest).user = user;

      return handler(req as OptionallyAuthedRequest, ctx);
    } catch (error) {
      // only unexpected errors (e.g. cookie read failure) fall through to here
      return fail(error);
    }
  };
}