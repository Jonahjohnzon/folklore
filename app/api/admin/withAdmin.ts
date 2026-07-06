import { withPermission } from "../auth/withPermission";

export function withAdmin(handler: Parameters<typeof withPermission>[1]) {
  return withPermission("admin", handler);
}