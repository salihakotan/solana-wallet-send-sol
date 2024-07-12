import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import WalletContextProvider from "@/providers/WalletContextProvider";
import Swap from "@/components/Swap";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wallet with Swap",
  description: "Superteam Turkey - Talent Olympics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <Header />
        
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}