import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { SettingsView } from "@/components/settings-view";

export default async function SettingsPage() {
  const user = await getSessionUser(await headers());
  if (!user) redirect("/login");
  return <SettingsView />;
}
