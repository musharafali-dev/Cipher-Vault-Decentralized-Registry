import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "CipherVault | Decentralized Record Registry dApp",
  description: "Enterprise-grade Web3 Decentralized Record Registry smart contract application built with Solidity, OpenZeppelin, Hardhat, Express, Prisma, and Next.js 15.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen">
        <Toaster position="top-right" theme="dark" richColors />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
