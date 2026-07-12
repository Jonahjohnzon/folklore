/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/payout-accounts/export/route.ts — CSV, opens fine in Excel
import { NextResponse } from "next/server";
import { withAdmin } from "@/app/api/admin/withAdmin";
import { connectToDatabase } from "@/app/api/lib/db/connect";
import { PayoutAccount } from "@/app/api/lib/models/PayoutAccount";
import { decryptSecret } from "@/app/api/lib/server/payout-crypto";

function csvEscape(value: unknown): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const GET = withAdmin(async () => {
  await connectToDatabase();

  const accounts = await PayoutAccount.find()
    .populate({ path: "userId", select: "username displayName email" })
    .sort({ method: 1, updatedAt: -1 })
    .lean();

  const headers = [
    "Username", "Display name", "Email", "Method",
    "Bank name", "Account name", "Account number",
    "Crypto network", "Wallet address", "Verified", "Updated",
  ];

  const rows = accounts.map((a: any) => [
    a.userId?.username ?? "",
    a.userId?.displayName ?? "",
    a.userId?.email ?? "",
    a.method,
    a.bankName ?? "",
    a.accountName ?? "",
    a.accountNumberEnc ? decryptSecret(a.accountNumberEnc) : "",
    a.cryptoNetwork ?? "",
    a.walletAddressEnc ? decryptSecret(a.walletAddressEnc) : "",
    a.verified ? "yes" : "no",
    new Date(a.updatedAt).toISOString(),
  ]);

  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="payout-accounts-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});