// app/services/PayoutService.ts
import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

interface Envelope<T> { success: boolean; data: T; message?: string }
export type PayoutMethod = "bank" | "crypto";
export type PayoutRequestStatus = "pending" | "approved" | "paid" | "rejected";

export interface PayoutAccountView {
  method: PayoutMethod;
  bankName: string | null;
  accountName: string | null;
  accountNumberMasked: string | null;
  cryptoNetwork: string | null;
  walletAddressMasked: string | null;
  verified: boolean;
  updatedAt: string;
}

export interface PayoutBalance {
  totalEarned: number;
  pendingOrApproved: number;
  available: number;
  minPayout: number;
}

export interface PayoutRequestRow {
  _id: string;
  amountCoins: number;
  method: PayoutMethod;
  status: PayoutRequestStatus;
  adminNote: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface SaveBankBody { method: "bank"; bankName: string; bankCode?: string; accountNumber: string; accountName: string }
export interface SaveCryptoBody { method: "crypto"; cryptoNetwork: string; walletAddress: string }

export const PayoutService = {
  get: () => api.get<Envelope<{ account: PayoutAccountView | null }>>("/api/creator/payout-account"),
  save: (body: SaveBankBody | SaveCryptoBody) =>
    api.put<Envelope<{ saved: boolean; verified: boolean }>>("/api/creator/payout-account", body),
  getRequests: () =>
  api.get<Envelope<{ balance: PayoutBalance; requests: PayoutRequestRow[] }>>("/api/creator/payout-requests"),
   requestPayout: (amountCoins: number) =>
  api.post<Envelope<{ request: { _id: string; status: PayoutRequestStatus } }>>("/api/creator/payout-requests", { amountCoins }),
   // app/services/PayoutService.ts — add
cancelRequest: (id: string) =>
  api.delete<Envelope<{ status: PayoutRequestStatus }>>(`/api/creator/payout-requests/${id}`),
};