"use client";

import { useCallback, useEffect, useState } from "react";
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

export function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [accountFilter, setAccountFilter] = useState("");
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

  async function handleDelete(id: string) {
    await deleteTransaction(id);
    await load();
  }

  const openAccounts = accounts.filter((a) => !a.closed);
  const filtered = accountFilter
    ? transactions.filter((tx) => tx.accountId === accountFilter)
    : transactions;

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
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors",
              !accountFilter
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:text-foreground"
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
                  : "border-border text-muted hover:text-foreground"
              )}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}

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
            emptyText="No transactions yet."
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
