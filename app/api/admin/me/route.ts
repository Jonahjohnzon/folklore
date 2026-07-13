// Forum API — app/api/pages/admin/me/route.ts
import { withAdmin } from "../withAdmin";
import { ok } from "../../response";

export const GET = withAdmin(async (req) => {
  return ok({ role: req.role });
});