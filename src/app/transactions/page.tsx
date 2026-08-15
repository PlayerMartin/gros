import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSessionUser } from "@/lib/auth";
import { TransactionsView } from "@/components/transactions-view";

export default async function TransactionsPage() {
  const user = await getSessionUser(await headers());
  if (!user) redirect("/login");
  return <TransactionsView />;
}
