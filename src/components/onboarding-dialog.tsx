"use client";

import { useEffect, useState } from "react";
import { AccountForm } from "@/components/account-form";

/**
 * Presented on first login when the user has no accounts yet. Blocks the app
 * behind a single create-account dialog.
 */
export function OnboardingDialog({
  hasAccounts,
  onCreated,
}: {
  hasAccounts: boolean;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!hasAccounts);
  }, [hasAccounts]);

  return (
    <AccountForm
      open={open}
      onClose={() => setOpen(false)}
      onSaved={onCreated}
      title="Let's get set up"
      description="You don't have any accounts yet. Create your first one to start tracking your finances."
    />
  );
}
