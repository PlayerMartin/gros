"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAccount } from "@/lib/api";

export function AccountForm({
  open,
  onClose,
  onSaved,
  title = "New account",
  description,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  title?: string;
  description?: string;
}) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Give your account a name");
      return;
    }
    setLoading(true);
    try {
      await createAccount({
        name: name.trim(),
        currency,
        initialBalance: balance ? Number(balance) : 0,
      });
      onSaved();
      onClose();
      setName("");
      setBalance("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      {description && (
        <p className="mb-4 text-sm text-muted">{description}</p>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Account name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Everyday account"
            required
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="EUR">EUR — Euro</option>
            <option value="CZK">CZK — Czech crown</option>
          </Select>
        </div>
        <div>
          <Label>Initial balance</Label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
            className="font-mono tabular-nums"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-expense/10 px-3 py-2 text-sm text-expense">{error}</p>
        )}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-[2]" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
