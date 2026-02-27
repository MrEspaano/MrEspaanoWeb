import type { Metadata } from "next";
import "./globals.css";
import { LenisProvider } from "@/components/providers/lenis-provider";

export const metadata: Metadata = {
  title: "MrEspaano Hub",
  description: "Hypermodern personlig hubb för appar, spel och hemsidor."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
