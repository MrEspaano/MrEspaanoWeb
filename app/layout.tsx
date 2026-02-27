import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/sw-register";

export const metadata: Metadata = {
  title: "BoardFlow",
  description: "Digital anslagstavla för lärare",
  manifest: "/manifest.webmanifest",
  applicationName: "BoardFlow",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BoardFlow"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
