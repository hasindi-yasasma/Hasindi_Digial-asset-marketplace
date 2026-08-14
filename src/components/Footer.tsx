'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cpu, Code2, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
                AC
              </div>
              <span className="font-extrabold text-lg text-white">AssetChain</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decentralized Digital Asset Marketplace powered by Next.js App Router, Ethereum smart contracts, OpenZeppelin standards, and immutable ledger trust.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/marketplace" className="hover:text-brand-400 transition-colors">Marketplace</Link></li>
              <li><Link href="/create" className="hover:text-brand-400 transition-colors">Mint Digital Asset</Link></li>
              <li><Link href="/my-assets" className="hover:text-brand-400 transition-colors">My Portfolio</Link></li>
              <li><Link href="/history" className="hover:text-brand-400 transition-colors">Blockchain History</Link></li>
            </ul>
          </div>

          {/* Platform Stats / Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Security & Specs</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ReentrancyGuard Protected</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Ethers.js v6 RPC Provider</span>
              </li>
              <li className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>Solidity 0.8.20 + OpenZeppelin</span>
              </li>
            </ul>
          </div>

          {/* API Health Route */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Next.js API Route</h4>
            <p className="text-xs text-slate-400">
              Integrated serverless endpoints reading on-chain EVM data directly on Vercel.
            </p>
            <a
              href="/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-brand-400 hover:text-white text-xs font-semibold hover:border-brand-500 transition-all"
            >
              <span>Check /api/health Endpoint</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AssetChain Decentralized Marketplace. All smart contract rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors">Single Source of Truth: Blockchain</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">Vercel Ready All-in-One</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
