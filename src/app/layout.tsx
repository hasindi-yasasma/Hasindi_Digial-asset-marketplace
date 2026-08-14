import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastContainer } from "@/components/Toast";

export const metadata: Metadata = {
  title: "AssetChain - Decentralized Digital Asset Marketplace",
  description: "Industry-quality Decentralized Digital Asset Marketplace DApp built with Solidity, Hardhat, Ethers.js v6, and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        <Web3Provider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
          <ToastContainer />
        </Web3Provider>
      </body>
    </html>
  );
}
