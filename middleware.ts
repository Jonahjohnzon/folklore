import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "https://www.tipatale.com",
  "https://tipatale.com",
  "http://localhost:3000",     // web dev
  "http://127.0.0.1:47821",    // Bookpad Electron app (packaged)
];

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const isAllowed = allowedOrigins.includes(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    if (isAllowed) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Credentials", "true");
      res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    return res;
  }

  const res = NextResponse.next();
  if (isAllowed) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}

export const config = {
  matcher: "/api/:path*",
};