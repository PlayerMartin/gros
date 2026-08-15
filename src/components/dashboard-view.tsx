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
  DashboardData,
  Tag,
  Transaction,
} from "@/lib/types";

/** Chrome chips: the selected filter inverts to ink-on-ivory, never gold. */
const chip = (active: boolean) =>
  cn(
    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
    active
      ? "border-foreground bg-foreground font-medium text-background"
      : "border-border text-muted hover:border-border-strong hover:text-foreground"
  );

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

  // Amounts shown follow the selected scope: an account's own currency when
  // filtered, the primary currency otherwise.
  const currency = data?.displayCurrency ?? data?.primary ?? "EUR";
  const accounts = data?.accounts ?? [];
  const hasAccounts = accounts.some((a) => !a.closed);
  const openAccounts = accounts.filter((a) => !a.closed);

  return (
    <div className="space-y-4 p-4 md:grid md:grid-cols-12 md:gap-5 md:space-y-0 md:p-6 lg:p-8">
      {/* Balance header — the one gold thing on the page */}
      <div className="pt-2 md:col-span-12 md:pt-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-2">
          Total balance
        </p>
        <p className="mt-2 font-mono text-5xl font-medium leading-none tracking-tight text-gold md:text-6xl">
          {formatCurrency(data?.totalBalance ?? 0, currency)}
        </p>
      </div>

      {/* Account filter chips */}
      {openAccounts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 md:col-span-12">
          <button onClick={() => setAccountFilter("")} className={chip(!accountFilter)}>
            All
          </button>
          {openAccounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccountFilter(a.id)}
              className={chip(accountFilter === a.id)}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

      {/* Per-account totals — each shown in its own currency */}
      {openAccounts.length > 0 && (
        <Card className="md:col-span-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            Accounts
          </p>
          <ul className="divide-y divide-border">
            {openAccounts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      accountFilter === a.id && "font-semibold text-foreground"
                    )}
                  >
                    {a.name}
                  </p>
                  <p className="text-xs text-muted-2">{a.currency}</p>
                </div>
                <p className="font-mono text-base font-semibold text-gold">
                  {formatCurrency(a.balance, a.currency)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Balance chart */}
      <Card className="md:col-span-8">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Balance over time
        </p>
        <BalanceChart data={data?.history ?? []} currency={currency} />
      </Card>

      {/* Spending */}
      <Card className="md:col-span-5">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Spending by tag
        </p>
        <SpendingPie data={data?.spending ?? []} currency={currency} />
      </Card>

      {/* Recent transactions */}
      <div className="md:col-span-7">
        <h2 className="mb-1 px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
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
        className="fixed right-4 bottom-20 z-30 h-14 w-14 rounded-full !p-0 shadow-lg shadow-black/40"
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