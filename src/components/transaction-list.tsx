"use client";

import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, X } from "@/components/icons";
import type { AccountSummary, Transaction } from "@/lib/types";

export function TransactionList({
  transactions,
  accounts,
  onEdit,
  onDelete,
  emptyText = "No transactions yet",
}: {
  transactions: Transaction[];
  accounts: AccountSummary[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  emptyText?: string;
}) {
  if (transactions.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-2">{emptyText}</div>
    );
  }

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  return (
    <ul className="divide-y divide-border">
      {transactions.map((tx) => {
        const currency = tx.accountId
          ? accountMap.get(tx.accountId)?.currency ?? "EUR"
          : "EUR";
        const isIn = tx.direction === "in";
        return (
          <li key={tx.id} className="flex items-center gap-3 py-3">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                isIn ? "bg-income/15 text-income" : "bg-expense/15 text-expense"
              )}
            >
              {isIn ? (
                <ArrowDownIcon className="h-4 w-4" />
              ) : (
                <ArrowUpIcon className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">
                  {tx.tagName ?? "Uncategorized"}
                </p>
                {tx.accountName && (
                  <span className="truncate text-xs text-muted-2">
                    {tx.accountName}
                  </span>
                )}
              </div>
              {tx.note && <p className="truncate text-xs text-muted">{tx.note}</p>}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p
                  className={cn(
                    "font-mono text-sm font-semibold",
                    isIn ? "text-income" : "text-foreground"
                  )}
                >
                  {isIn ? "+" : "−"}
                  {formatCurrency(tx.amount ?? 0, currency)}
                </p>
                <p className="text-[11px] text-muted-2">
                  {new Date(tx.date + "T00:00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onEdit(tx)}
                  className="rounded-md px-1.5 py-0.5 text-[11px] text-muted hover:bg-surface-2 hover:text-foreground"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this transaction?")) onDelete(tx.id);
                  }}
                  className="flex items-center justify-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-2 hover:bg-expense/15 hover:text-expense"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
