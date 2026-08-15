'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cpu, Code2, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-xl text-slate-600 py-12 mt-auto relative z-10">
      {/* Ecosystem Partners bar matching reference design */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            Powered By Trusted On-Chain Infrastructure
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
          <span className="font-extrabold text-sm text-slate-700 tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ethereum Sepolia
          </span>
          <span className="font-extrabold text-sm text-slate-700 tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Ethers v6
          </span>
          <span className="font-extrabold text-sm text-slate-700 tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> OpenZeppelin ERC-721
          </span>
          <span className="font-extrabold text-sm text-slate-700 tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Next.js App Router
          </span>
          <span className="font-extrabold text-sm text-slate-700 tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> MetaMask Web3
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200/70">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/20">
                AC
              </div>
              <span className="font-black text-lg text-slate-900">AssetChain</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Decentralized Digital Asset Marketplace powered by Next.js App Router, Ethereum smart contracts, OpenZeppelin standards, and immutable ledger trust.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="/marketplace" className="hover:text-emerald-600 transition-colors">Marketplace</Link></li>
              <li><Link href="/create" className="hover:text-emerald-600 transition-colors">Mint Digital Asset</Link></li>
              <li><Link href="/my-assets" className="hover:text-emerald-600 transition-colors">My Portfolio</Link></li>
              <li><Link href="/history" className="hover:text-emerald-600 transition-colors">Blockchain History</Link></li>
            </ul>
          </div>

          {/* Platform Stats / Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Security & Specs</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>ReentrancyGuard Protected</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-500" />
                <span>Ethers.js v6 Resilient RPC</span>
              </li>
              <li className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-500" />
                <span>Solidity 0.8.20 + OpenZeppelin</span>
              </li>
            </ul>
          </div>

          {/* API Health Route */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Next.js API Route</h4>
            <p className="text-xs text-slate-500 font-medium">
              Integrated serverless endpoints reading on-chain EVM data directly on Vercel.
            </p>
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-emerald-700 hover:text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-all shadow-sm"
            >
              <span>Check /api/health Endpoint</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-medium">
          <p>© {new Date().getFullYear()} AssetChain Decentralized Marketplace. All smart contract rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-700 transition-colors">Single Source of Truth: Blockchain</span>
            <span>•</span>
            <span className="hover:text-slate-700 transition-colors">Vercel Ready All-in-One</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
