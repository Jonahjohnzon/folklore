import { NextRequest } from "next/server";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { Report, type ReportStatus } from "@/app/api/lib/models/Report";
import { ok, fail } from "@/app/api/response";
import { withAdmin } from "../withAdmin";

const STATUSES = ["open", "reviewing", "resolved", "dismissed"];

export const GET = withAdmin(async (req: NextRequest) => {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Number(searchParams.get("limit")) || 20);

    const filter: { status?: ReportStatus } = {};
    if (status && STATUSES.includes(status)) filter.status = status as ReportStatus;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter),
    ]);

    return ok({
      reports: reports.map((r) => ({ ...r, id: String(r._id), _id: undefined })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return fail(error);
  }
});

export const PATCH = withAdmin(async (req: NextRequest) => {
  try {
    await connectToDatabase();
    const { id, status } = await req.json();

    if (!id || !STATUSES.includes(status)) {
      return fail(new Error("Invalid id or status"));
    }

    const report = await Report.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!report) return fail(new Error("Report not found"));

    return ok({ report: { ...report, id: String(report._id), _id: undefined } });
  } catch (error) {
    return fail(error);
  }
});