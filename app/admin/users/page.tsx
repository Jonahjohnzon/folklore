// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AdminService, type AdminUserRow, type AdminUserStatus, type AdminUserRole } from "@/app/services/AdminService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  function load(pageToLoad: number, query: string) {
    setLoading(true);
    AdminService.getUsers(pageToLoad, query || undefined)
      .then((res) => {
        setUsers(res.data.users);
        setHasMore(res.data.hasMore);
        setPage(pageToLoad);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(1, "");
  }, []);

  async function handleStatusChange(userId: string, status: AdminUserStatus) {
    const prev = users;
    setUsers((u) => u.map((row) => (row._id === userId ? { ...row, status } : row)));
    try {
      await AdminService.updateUserStatus(userId, status);
    } catch {
      setUsers(prev); // revert on failure
    }
  }

  async function handleRoleChange(userId: string, role: AdminUserRole) {
    const prev = users;
    setUsers((u) => u.map((row) => (row._id === userId ? { ...row, role } : row)));
    try {
      await AdminService.updateUserRole(userId, role);
    } catch {
      setUsers(prev);
    }
  }

  async function handleVerifyChange(userId: string, verified: boolean) {
  const prev = users;
  setUsers((u) => u.map((row) => (row._id === userId ? { ...row, verifiedAuthor: verified } : row)));
  try {
    await AdminService.updateVerifiedAuthor(userId, verified);
  } catch {
    setUsers(prev);
  }
    }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(1, q);
        }}
        className="mt-4"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by username, name…"
          className="w-full max-w-sm rounded-lg border border-hairline px-3 py-2 font-sans text-sm"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full text-left font-sans text-sm">
          <thead className="border-b border-hairline text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-2.5">User</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Creator</th>
              <th className="px-4 py-2.5">Joined</th>
              <th className="px-4 py-2.5">Verified</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-ink">{u.displayName || u.username}</p>
                  <p className="text-xs text-ink-muted">@{u.username}</p>
                </td>
                <td className="px-4 py-2.5">
                  <select
                    value={u.status}
                    onChange={(e) => handleStatusChange(u._id, e.target.value as AdminUserStatus)}
                    className="rounded border border-hairline bg-transparent px-2 py-1 text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </td>
                <td className="px-4 py-2.5">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value as AdminUserRole)}
                    className="rounded border border-hairline bg-transparent px-2 py-1 text-xs"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-2.5 text-ink-muted">{u.creatorStatus}</td>
                <td className="px-4 py-2.5 text-ink-muted">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5">
                <input
                    type="checkbox"
                    checked={u.verifiedAuthor}
                    onChange={(e) => handleVerifyChange(u._id, e.target.checked)}
                />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <p className="mt-4 font-sans text-sm text-ink-muted">Loading…</p>}

      <div className="mt-4 flex gap-2">
        {page > 1 && (
          <button onClick={() => load(page - 1, q)} className="font-sans text-sm text-accent hover:underline">
            Previous
          </button>
        )}
        {hasMore && (
          <button onClick={() => load(page + 1, q)} className="font-sans text-sm text-accent hover:underline">
            Next
          </button>
        )}
      </div>
    </div>
  );
}