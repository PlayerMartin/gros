import type {
  AccountSummary,
  DashboardData,
  Tag,
  Transaction,
} from "./types";

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (body as { error?: string }).error ?? `Request failed (${res.status})`
    );
  }
  return body as T;
}

const qs = (params: Record<string, string>) => {
  const s = new URLSearchParams(params).toString();
  return s ? `?${s}` : "";
};

// ---- dashboard ----
export function getDashboard(filters?: {
  accountId?: string;
  from?: string;
  to?: string;
}): Promise<DashboardData> {
  const p: Record<string, string> = {};
  if (filters?.accountId) p.accountId = filters.accountId;
  if (filters?.from) p.from = filters.from;
  if (filters?.to) p.to = filters.to;
  return http<DashboardData>(`/api/dashboard${qs(p)}`);
}

// ---- transactions ----
export interface TxInput {
  accountId: string;
  amount: number;
  direction: "in" | "out";
  tagId?: string | null;
  date: string;
  note?: string | null;
}

export function getTransactions(accountId?: string): Promise<{ transactions: Transaction[] }> {
  return http(`/api/transactions${accountId ? qs({ accountId }) : ""}`);
}
export function createTransaction(input: TxInput) {
  return http("/api/transactions", { method: "POST", body: JSON.stringify(input) });
}
export function editTransaction(id: string, input: TxInput) {
  return http(`/api/transactions/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
export function deleteTransaction(id: string) {
  return http(`/api/transactions/${id}`, { method: "DELETE" });
}
export function createTransfer(input: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  note?: string | null;
}) {
  return http("/api/transfers", { method: "POST", body: JSON.stringify(input) });
}

// ---- accounts ----
export function getAccounts(): Promise<{ accounts: AccountSummary[] }> {
  return http("/api/accounts");
}
export function createAccount(input: {
  name: string;
  currency: string;
  initialBalance?: number;
}) {
  return http("/api/accounts", { method: "POST", body: JSON.stringify(input) });
}
export function closeAccount(id: string) {
  return http(`/api/accounts/${id}`, {
    method: "POST",
    body: JSON.stringify({ action: "close" }),
  });
}

// ---- tags ----
export function getTags(): Promise<{ tags: Tag[] }> {
  return http("/api/tags");
}
export function createTag(name: string): Promise<{ tag: Tag }> {
  return http("/api/tags", { method: "POST", body: JSON.stringify({ name }) });
}
export function renameTag(id: string, name: string) {
  return http(`/api/tags/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
}
export function deleteTag(id: string) {
  return http(`/api/tags/${id}`, { method: "DELETE" });
}

// ---- settings ----
export function getSettings(): Promise<{ primaryCurrency: string }> {
  return http("/api/settings");
}
export function setSettings(primaryCurrency: string) {
  return http("/api/settings", {
    method: "POST",
    body: JSON.stringify({ primaryCurrency }),
  });
}

// ---- exchange rates ----
export function refreshRates() {
  return http("/api/exchange-rates/refresh", { method: "POST" });
}
