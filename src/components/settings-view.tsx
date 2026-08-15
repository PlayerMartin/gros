"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAccounts,
  getTags,
  getSettings,
  createTag,
  renameTag,
  deleteTag,
  setSettings as saveSettings,
  closeAccount,
} from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { Card, Spinner } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, LogOutIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { AccountForm } from "@/components/account-form";
import type { AccountSummary, Tag } from "@/lib/types";

export function SettingsView() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [currency, setCurrency] = useState("EUR");
  const [loading, setLoading] = useState(true);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [a, t, s] = await Promise.all([getAccounts(), getTags(), getSettings()]);
    setAccounts(a.accounts);
    setTags(t.tags);
    setCurrency(s.primaryCurrency);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [load]);

  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  }

  async function addTag() {
    if (!newTag.trim()) return;
    try {
      await createTag(newTag.trim());
      setNewTag("");
      await load();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed to add tag");
    }
  }

  return (
    <div className="space-y-5 p-4">
      <h1 className="text-xl font-bold tracking-tight">Settings</h1>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <>
          {/* Currency */}
          <Card>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Primary currency
            </h3>
            <Select
              value={currency}
              onChange={async (e) => {
                const next = e.target.value;
                setCurrency(next);
                await saveSettings(next);
                flash("Primary currency updated");
                // Tell every mounted view (dashboard, activity, …) to re-sync
                // its currency display immediately.
                window.dispatchEvent(new CustomEvent("finance:currency-changed"));
                router.refresh();
              }}
            >
              <option value="EUR">EUR — Euro</option>
              <option value="CZK">CZK — Czech crown</option>
            </Select>
            <p className="mt-2 text-xs text-muted-2">
              Dashboard amounts are converted to this currency.
            </p>
          </Card>

          {/* Accounts */}
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Accounts
              </h3>
              <Button size="sm" variant="secondary" onClick={() => setAccountFormOpen(true)}>
                <PlusIcon className="h-4 w-4" />
                Add
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {accounts.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {a.name}
                      {a.closed && (
                        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-2">
                          Closed
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-2">{a.currency}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">
                      {formatCurrency(a.balance, a.currency)}
                    </p>
                    {!a.closed && (
                      <button
                        onClick={async () => {
                          if (confirm(`Close "${a.name}"?`)) {
                            await closeAccount(a.id);
                            await load();
                          }
                        }}
                        className="text-[11px] text-muted-2 hover:text-expense"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {accounts.length === 0 && (
                <li className="py-3 text-sm text-muted-2">
                  No accounts yet. Add one to get started.
                </li>
              )}
            </ul>
          </Card>

          {/* Tags */}
          <Card>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              Tags
            </h3>
            <div className="mb-3 flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="New tag name"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            <ul className="divide-y divide-border">
              {tags.map((t) => (
                <li key={t.id} className="flex items-center gap-2 py-2">
                  <input
                    defaultValue={t.name}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== t.name) {
                        renameTag(t.id, v).catch((err) =>
                          flash(err instanceof Error ? err.message : "Rename failed")
                        );
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                    className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm hover:border-border focus:border-accent/60 focus:bg-surface focus:outline-none"
                    aria-label={`Rename ${t.name}`}
                  />
                  {t.name !== "Uncategorized" && (
                    <button
                      onClick={async () => {
                        try {
                          await deleteTag(t.id);
                          await load();
                        } catch (e) {
                          flash(
                            e instanceof Error ? e.message : "Delete failed"
                          );
                        }
                      }}
                      className="rounded-md px-2 py-1 text-xs text-muted-2 hover:bg-expense/15 hover:text-expense"
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          {/* Logout */}
          <Button
            variant="danger"
            size="lg"
            className="w-full"
            onClick={async () => {
              await authClient.signOut();
              router.push("/login");
              router.refresh();
            }}
          >
            <LogOutIcon className="h-4 w-4" />
            Sign out
          </Button>
        </>
      )}

      {message && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-surface-2 px-4 py-2 text-sm shadow-lg">
          {message}
        </div>
      )}

      <AccountForm
        open={accountFormOpen}
        onClose={() => setAccountFormOpen(false)}
        onSaved={load}
        title="New account"
      />
    </div>
  );
}
