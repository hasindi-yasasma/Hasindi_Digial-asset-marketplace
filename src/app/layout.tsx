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
    <html lang="en" className="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased relative selection:bg-emerald-100 selection:text-emerald-900">
        {/* Soft Ambient Aura Gradients matching reference design */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Top-Right Purple/Pink Aura */}
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-purple-300/40 via-fuchsia-200/30 to-transparent rounded-full blur-3xl opacity-70" />
          {/* Top-Left Mint/Teal Aura */}
          <div className="absolute -top-40 -left-20 w-[550px] h-[550px] bg-gradient-to-tr from-emerald-200/50 via-teal-100/40 to-transparent rounded-full blur-3xl opacity-80" />
          {/* Bottom-Center Soft Blue Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-teal-50/40 via-cyan-100/20 to-purple-50/30 rounded-full blur-3xl opacity-60" />
        </div>

        <Web3Provider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
