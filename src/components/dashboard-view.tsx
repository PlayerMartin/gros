"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDashboard,
  getTransactions,
  getTags,
  deleteTransaction,
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { Card, Spinner } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons";
import { SpendingPie } from "@/components/charts/spending-pie";
import { BalanceChart } from "@/components/charts/balance-chart";
import { TransactionList } from "@/components/transaction-list";
import { TransactionForm } from "@/components/transaction-form";
import { OnboardingDialog } from "@/components/onboarding-dialog";
import type {
  AccountSummary,
  DashboardData,
  Tag,
  Transaction,
} from "@/lib/types";

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [accountFilter, setAccountFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const load = useCallback(async () => {
    const [d, t, g] = await Promise.all([
      getDashboard({ accountId: accountFilter || undefined }),
      getTransactions(),
      getTags(),
    ]);
    setData(d);
    setTags(g.tags);
    // Recent activity is always the latest first, regardless of API order.
    const filtered = (accountFilter
      ? t.transactions.filter((x) => x.accountId === accountFilter)
      : t.transactions
    ).sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        b.createdAt.localeCompare(a.createdAt)
    );
    setTransactions(filtered);
    setLoading(false);
  }, [accountFilter]);

  useEffect(() => {
    setLoading(true);
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
  function handleSaved() {
    load();
  }

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const currency = data?.primary ?? "EUR";
  const accounts = data?.accounts ?? [];
  const hasAccounts = accounts.some((a) => !a.closed);
  const openAccounts = accounts.filter((a) => !a.closed);

  return (
    <div className="space-y-4 p-4">
      {/* Balance header */}
      <div className="pt-2">
        <p className="text-xs uppercase tracking-wide text-muted-2">
          Total balance
        </p>
        <p className="mt-0.5 text-3xl font-bold tracking-tight">
          {formatCurrency(data?.totalBalance ?? 0, currency)}
        </p>
      </div>

      {/* Per-account totals — each shown in its own currency */}
      {openAccounts.length > 0 && (
        <Card>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Accounts
          </p>
          <ul className="divide-y divide-border">
            {openAccounts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      accountFilter === a.id && "text-accent",
                    )}
                  >
                    {a.name}
                  </p>
                  <p className="text-xs text-muted-2">{a.currency}</p>
                </div>
                <p className="font-mono text-sm font-semibold">
                  {formatCurrency(a.balance, a.currency)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Account filter chips */}
      {openAccounts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setAccountFilter("")}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
              !accountFilter
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            All
          </button>
          {openAccounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccountFilter(a.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
                accountFilter === a.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      {/* Balance chart */}
      <Card>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Balance over time
        </p>
        <BalanceChart data={data?.history ?? []} currency={currency} />
      </Card>

      {/* Spending */}
      <Card>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Spending by tag
        </p>
        <SpendingPie data={data?.spending ?? []} currency={currency} />
      </Card>

      {/* Recent transactions */}
      <div>
        <h2 className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Recent activity
        </h2>
        <Card className="p-2">
          <TransactionList
            transactions={transactions.slice(0, 5)}
            accounts={openAccounts}
            onEdit={(tx) => {
              setEditing(tx);
              setFormOpen(true);
            }}
            onDelete={handleDelete}
            emptyText="No transactions yet. Add your first one."
          />
        </Card>
      </div>

      {/* Floating add button */}
      <Button
        size="lg"
        className="fixed right-4 bottom-20 z-30 h-14 w-14 rounded-full !p-0 shadow-lg shadow-accent/20"
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
        aria-label="Add transaction"
      >
        <PlusIcon className="h-6 w-6" />
      </Button>

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        accounts={openAccounts}
        tags={tags}
        editing={editing}
        onSaved={handleSaved}
        onTagCreated={load}
      />

      {!hasAccounts && (
        <OnboardingDialog hasAccounts={false} onCreated={load} />
      )}
    </div>
  );
}
