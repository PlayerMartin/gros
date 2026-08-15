import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { getSessionUser } from "@/lib/auth";
import { headers } from "next/headers";

/*
 * Self-hosted fonts, vendored in this repo (SIL OFL — licenses in
 * src/app/fonts/OFL-*.txt). Using next/font/local instead of next/font/google
 * means the Docker build makes ZERO outbound requests for type — no Google
 * Fonts fetch, no DNS, no hang.
 *
 * Full-coverage TTFs sourced from the google/fonts GitHub repo (not subset
 * woff2), so Czech diacritics in money strings render properly: the CZK mark
 * is "Kč" (U+010D, latin-ext) and tag/account names may contain ž/š/ř/ě/ů.
 *   - Space Grotesk  variable TTF
 *   - IBM Plex Mono  static TTFs 400/500/600/700
 */
const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-Variable.ttf",
  weight: "400 700",
  style: "normal",
  display: "swap",
  variable: "--font-space-grotesk",
});

const plexMono = localFont({
  src: [
    {
      path: "./fonts/IBMPlexMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexMono-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexMono-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/IBMPlexMono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-plex-mono",
});

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
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col md:max-w-3xl lg:max-w-5xl">
          <main className="flex-1 pb-24">{children}</main>
          {user && <BottomNav />}
        </div>
      </body>
    </html>
  );
}