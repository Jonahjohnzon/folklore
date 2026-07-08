import ApiClient from "@/app/ApiCore";
const api = new ApiClient();

export interface CoinActivityItem {
  status: string;
  id: string;
  label: string;
  coins: number;
  date: string;
}

export const CoinService = {
  getBalance() {
    return api.get<{ data: { coinBalance: number } }>("/api/coins/balance");
  },

  getTransactions() {
    return api.get<{ data: CoinActivityItem[] }>("/api/coins/transactions");
  },
};