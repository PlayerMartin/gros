import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { getSessionUser } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Fold · Personal Finance",
  description: "A self-hosted personal finance tracker with event sourcing.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser(await headers());

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
          <main className="flex-1 pb-24">{children}</main>
          {user && <BottomNav />}
        </div>
      </body>
    </html>
  );
}
