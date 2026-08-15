"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createTag,
  createTransaction,
  editTransaction,
  createTransfer,
} from "@/lib/api";
import { PlusIcon } from "@/components/icons";
import type { AccountSummary, Tag, Transaction } from "@/lib/types";

const today = () => new Date().toISOString().slice(0, 10);

export function TransactionForm({
  open,
  onClose,
  accounts,
  tags,
  editing,
  onSaved,
  onTagCreated,
}: {
  open: boolean;
  onClose: () => void;
  accounts: AccountSummary[];
  tags: Tag[];
  editing?: Transaction | null;
  onSaved: () => void;
  onTagCreated?: () => void;
}) {
  const [mode, setMode] = useState<"entry" | "transfer">("entry");
  const [direction, setDirection] = useState<"in" | "out">("out");
  const [accountId, setAccountId] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [tagId, setTagId] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tagCreating, setTagCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [tagSaving, setTagSaving] = useState(false);

  const openAccounts = accounts.filter((a) => !a.closed);
  const primaryTag = tags.find((t) => t.name === "Uncategorized");
  const defaultTagId = primaryTag?.id ?? "";

  useEffect(() => {
    if (open) {
      setError(null);
      setMode("entry");
      setDirection("out");
      setDate(today());
      setNote("");
      setAmount("");
      setTagId(defaultTagId);
      setTagCreating(false);
      setNewTagName("");
      setTagError(null);
      const first = openAccounts[0];
      setAccountId(first?.id ?? "");
      setFromAccountId(first?.id ?? "");
      setToAccountId(openAccounts[1]?.id ?? first?.id ?? "");
      if (editing) {
        setAccountId(editing.accountId ?? first?.id ?? "");
        setDirection(editing.direction);
        setAmount(String(editing.amount));
        setTagId(editing.tagId ?? defaultTagId);
        setDate(editing.date);
        setNote(editing.note ?? "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      if (mode === "transfer") {
        if (!fromAccountId || !toAccountId || fromAccountId === toAccountId) {
          setError("Pick two different accounts");
          setLoading(false);
          return;
        }
        await createTransfer({ fromAccountId, toAccountId, amount: amt, date, note: note || null });
      } else if (editing) {
        await editTransaction(editing.id, {
          accountId,
          amount: amt,
          direction,
          tagId: tagId || null,
          date,
          note: note || null,
        });
      } else {
        await createTransaction({
          accountId,
          amount: amt,
          direction,
          tagId: tagId || null,
          date,
          note: note || null,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function createNewTag() {
    const name = newTagName.trim();
    if (!name) return;
    setTagError(null);
    setTagSaving(true);
    try {
      const { tag } = await createTag(name);
      setTagId(tag.id);
      setNewTagName("");
      setTagCreating(false);
      onTagCreated?.();
    } catch (err) {
      setTagError(err instanceof Error ? err.message : "Failed to create tag");
    } finally {
      setTagSaving(false);
    }
  }

  const title = editing ? "Edit transaction" : mode === "transfer" ? "New transfer" : "Add transaction";

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form onSubmit={submit} className="space-y-4">
        {!editing && (
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
            {(["entry", "transfer"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "h-9 rounded-lg text-sm font-medium transition-colors",
                  mode === m ? "bg-accent text-[#052014]" : "text-muted"
                )}
              >
                {m === "entry" ? "Entry" : "Transfer"}
              </button>
            ))}
          </div>
        )}

        {mode === "transfer" && !editing ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>From account</Label>
                <Select value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)}>
                  {openAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.currency}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>To account</Label>
                <Select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)}>
                  {openAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.currency}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-2 p-1">
              {(["out", "in"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className={cn(
                    "h-9 rounded-lg text-sm font-medium transition-colors",
                    direction === d
                      ? d === "out"
                        ? "bg-expense text-[#1f060a]"
                        : "bg-accent text-[#052014]"
                      : "text-muted"
                  )}
                >
                  {d === "out" ? "Expense" : "Income"}
                </button>
              ))}
            </div>

            <div>
              <Label>Account</Label>
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {openAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.currency}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>Tag</Label>
              {tagCreating ? (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        createNewTag();
                      } else if (e.key === "Escape") {
                        setTagCreating(false);
                        setNewTagName("");
                        setTagError(null);
                      }
                    }}
                    placeholder="New tag name"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-24 shrink-0"
                    onClick={createNewTag}
                    disabled={tagSaving}
                  >
                    {tagSaving ? "…" : "Add"}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={tagId}
                    onChange={(e) => setTagId(e.target.value)}
                    className="min-w-0 flex-1"
                  >
                    {tags.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-11 shrink-0 !px-0"
                    onClick={() => setTagCreating(true)}
                    aria-label="Create new tag"
                    title="Create new tag"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {tagError && (
                <p className="mt-1 text-xs text-expense">{tagError}</p>
              )}
            </div>
          </>
        )}

        <div>
          <Label>Amount</Label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div>
          <Label>Note (optional)</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. groceries"
            rows={2}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-expense/10 px-3 py-2 text-sm text-expense">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-[2]" disabled={loading}>
            {loading ? "Saving…" : editing ? "Save changes" : mode === "transfer" ? "Transfer" : "Add"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
