import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { DashboardView } from "@/components/dashboard-view";

export default async function DashboardPage() {
  const user = await getSessionUser(await headers());
  if (!user) redirect("/login");
  return <DashboardView />;
}
