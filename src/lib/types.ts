// Shared UI data shapes (mirror the API responses).

export interface AccountSummary {
  id: string;
  name: string;
  currency: string;
  balance: number;
  balancePrimary: number;
  initialBalance: number;
  createdAt: string;
  closed: boolean;
}

export interface SpendingBucket {
  tagId: string | null;
  tagName: string;
  amount: number;
  currency: string;
}

export interface BalancePoint {
  date: string;
  value: number;
}

export interface DashboardData {
  accounts: AccountSummary[];
  spending: SpendingBucket[];
  history: BalancePoint[];
  primary: string;
  /** Currency all amounts are expressed in (account currency when filtered). */
  displayCurrency: string;
  totalBalance: number;
}

export interface Transaction {
  id: string;
  accountId: string | null;
  accountName: string | null;
  amount: number;
  direction: "in" | "out";
  tagId: string | null;
  tagName: string | null;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}
