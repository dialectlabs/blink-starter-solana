import type { Metadata } from "next";

import { Navbar } from "./components/navbar";
import "./globals.css";

import AppWalletProvider from "./components/AppWalletProvider";

export const metadata: Metadata = {
  title: "Blinks Scaffold Solana",
  description:
    "Build Blinks in minutes with Dialect Labs's Blinks Scaffold for Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppWalletProvider>
          <Navbar />
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
