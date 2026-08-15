"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTransactions,
  getTags,
  getAccounts,
  deleteTransaction,
} from "@/lib/api";
import { Card, Spinner } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { TransactionList } from "@/components/transaction-list";
import { TransactionForm } from "@/components/transaction-form";
import type { AccountSummary, Tag, Transaction } from "@/lib/types";

// Compact field styling for the filter strip (avoids the ui/input heights).
const filterField =
  "min-w-0 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground placeholder:text-muted-2 outline-none transition-colors focus:border-foreground/60 focus:ring-2 focus:ring-foreground/15";

/** Chrome chips: the selected filter inverts to ink-on-ivory, never gold. */
const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
    active
      ? "border-foreground bg-foreground font-medium text-background"
      : "border-border text-muted hover:border-border-strong hover:text-foreground"
  );

export function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [accountFilter, setAccountFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const load = useCallback(async () => {
    const [t, g, a] = await Promise.all([getTransactions(), getTags(), getAccounts()]);
    setTransactions(t.transactions);
    setTags(g.tags);
    setAccounts(a.accounts);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  // Re-sync whenever the user changes the primary currency elsewhere.
  useEffect(() => {
    const sync = () => load();
    window.addEventListener("finance:currency-changed", sync);
    return () => window.removeEventListener("finance:currency-changed", sync);
  }, [load]);

  async function handleDelete(id: string) {
    await deleteTransaction(id);
    await load();
  }

  const openAccounts = accounts.filter((a) => !a.closed);

  const filtered = useMemo(() => {
    let list = accountFilter
      ? transactions.filter((tx) => tx.accountId === accountFilter)
      : [...transactions];

    if (fromDate) list = list.filter((tx) => tx.date >= fromDate);
    if (toDate) list = list.filter((tx) => tx.date <= toDate);
    const min = minAmount === "" ? null : Number(minAmount);
    const max = maxAmount === "" ? null : Number(maxAmount);
    if (min !== null && !Number.isNaN(min)) {
      list = list.filter((tx) => tx.amount >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      list = list.filter((tx) => tx.amount <= max);
    }

    switch (sortBy) {
      case "oldest":
        list.sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            a.createdAt.localeCompare(b.createdAt)
        );
        break;
      case "amountHigh":
        list.sort((a, b) => b.amount - a.amount);
        break;
      case "amountLow":
        list.sort((a, b) => a.amount - b.amount);
        break;
      default: // newest
        list.sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            b.createdAt.localeCompare(a.createdAt)
        );
    }
    return list;
  }, [
    transactions,
    accountFilter,
    sortBy,
    fromDate,
    toDate,
    minAmount,
    maxAmount,
  ]);

  const hasFilters =
    sortBy !== "newest" ||
    fromDate !== "" ||
    toDate !== "" ||
    minAmount !== "" ||
    maxAmount !== "" ||
    accountFilter !== "";

  function clearFilters() {
    setSortBy("newest");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setAccountFilter("");
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Activity</h1>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <PlusIcon className="h-4 w-4" />
          Add
        </Button>
      </div>

      {openAccounts.length > 1 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setAccountFilter("")}
            className={cn(chip(!accountFilter))}
          >
            All
          </button>
          {openAccounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccountFilter(a.id)}
              className={cn(chip(accountFilter === a.id))}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      {/* Sort + filters (compact strip) */}
      <div className="mb-3 rounded-lg border border-border bg-surface p-2">
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={cn(filterField, "h-7 flex-1 cursor-pointer appearance-none pr-6")}
            aria-label="Sort transactions"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amountHigh">Amount: high to low</option>
            <option value="amountLow">Amount: low to high</option>
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="shrink-0 text-[11px] font-medium text-foreground underline-offset-2 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="mt-1.5 grid grid-cols-4 gap-1">
          <span className="px-1 text-[10px] font-medium text-muted-2">From</span>
          <span className="px-1 text-[10px] font-medium text-muted-2">To</span>
          <span className="px-1 text-[10px] font-medium text-muted-2">Min</span>
          <span className="px-1 text-[10px] font-medium text-muted-2">Max</span>
        </div>
        <div className="mt-0.5 grid grid-cols-4 gap-1">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={cn(filterField, "h-8 [color-scheme:dark]")}
            aria-label="From date"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={cn(filterField, "h-8 [color-scheme:dark]")}
            aria-label="To date"
          />
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="0.00"
            className={cn(filterField, "h-8")}
            aria-label="Minimum amount"
          />
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            placeholder="Max"
            className={cn(filterField, "h-8")}
            aria-label="Maximum amount"
          />
        </div>
      </div>

      {loading && !transactions.length ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <Card className="p-2">
          <TransactionList
            transactions={filtered}
            accounts={openAccounts}
            onEdit={(tx) => {
              setEditing(tx);
              setFormOpen(true);
            }}
            onDelete={handleDelete}
            emptyText={
              transactions.length === 0
                ? "No transactions yet."
                : "No transactions match these filters."
            }
          />
        </Card>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        accounts={openAccounts}
        tags={tags}
        editing={editing}
        onSaved={load}
        onTagCreated={load}
      />
    </div>
  );
}
