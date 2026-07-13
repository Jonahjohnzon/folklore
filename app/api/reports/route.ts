import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Report } from "@/app/api/lib/models/Report";
import { ok, fail } from "@/app/api/response";
import { optionalAuth } from "@/app/api/auth/optionalAuth";

const REPORT_TYPES = ["book", "chapter", "comment", "user", "other"];
const REPORT_REASONS = [
  "copyright",
  "harassment",
  "spam",
  "untagged_mature",
  "impersonation",
  "underage",
  "other",
];

export const POST = optionalAuth(async (req) => {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { type, reason, url, description, email } = body ?? {};

    if (!REPORT_TYPES.includes(type)) {
      return fail(new Error("Invalid report type"));
    }
    if (!REPORT_REASONS.includes(reason)) {
      return fail(new Error("Invalid report reason"));
    }
    if (typeof description !== "string" || !description.trim()) {
      return fail(new Error("Description is required"));
    }
    if (email && typeof email === "string") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return fail(new Error("Invalid email address"));
      }
    }

    const report = await Report.create({
      type,
      reason,
      url: typeof url === "string" ? url.slice(0, 2000) : undefined,
      description: description.slice(0, 5000),
      email: typeof email === "string" ? email.slice(0, 320) : undefined,
      reporterId: req.user?.sub ?? null,
    });

    return ok({ id: String(report._id) });
  } catch (error) {
    return fail(error);
  }
});