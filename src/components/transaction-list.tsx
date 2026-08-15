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
          <li key={tx.id} className="flex items-center">
            <button
              type="button"
              onClick={() => onEdit(tx)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-3 text-left transition-colors hover:bg-surface-2/50"
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  isIn ? "bg-gold/12 text-gold" : "bg-ember/12 text-ember"
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
                {tx.note && (
                  <p className="truncate text-xs text-muted">{tx.note}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={cn(
                    "font-mono text-base font-semibold tabular-nums",
                    isIn ? "text-gold" : "text-ember"
                  )}
                >
                  {isIn ? "+" : "−"}
                  {formatCurrency(tx.amount ?? 0, currency)}
                </p>
                <p className="text-xs text-muted-2">
                  {new Date(
                    tx.date + "T00:00:00"
                  ).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this transaction?")) onDelete(tx.id);
              }}
              className="mr-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center self-center rounded-md text-muted-2 transition-colors hover:bg-ember/15 hover:text-ember"
              aria-label="Delete transaction"
              title="Delete transaction"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}