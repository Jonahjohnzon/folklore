// lib/api/errors.ts
export function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    // 422 shape from your interceptor: error.response.data (e.g. { message, fieldErrors })
    if ("message" in err && typeof (err as any).message === "string") {
      return (err as any).message;
    }
  }
  return "Something went wrong. Please try again.";
}

export function getFieldErrors(err: unknown): Record<string, string[]> | undefined {
  if (err && typeof err === "object" && "fieldErrors" in err) {
    return (err as any).fieldErrors;
  }
  return undefined;
}