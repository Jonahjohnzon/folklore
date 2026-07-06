import { NextResponse } from "next/server";
import { AppError } from "@/app/api/lib/db/errors";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function fail(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: { code: error.code, message: error.message, details: error.details },
      },
      { status: error.status }
    );
  }

  // Unexpected/unhandled error — log it, don't leak internals to the client
  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
    { status: 500 }
  );
}

export function methodNotAllowed(allowed: string[]) {
  return NextResponse.json(
    { success: false, error: { code: "METHOD_NOT_ALLOWED", message: `Allowed: ${allowed.join(", ")}` } },
    { status: 405, headers: { Allow: allowed.join(", ") } }
  );
}