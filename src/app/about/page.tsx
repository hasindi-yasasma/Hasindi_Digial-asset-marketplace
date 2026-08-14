'use client';

import React from 'react';
import { ShieldCheck, Zap, Layers, Database, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
          <Layers className="w-4 h-4 text-brand-400" />
          <span>System Architecture & Engineering</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Decentralized Digital Asset Marketplace
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An enterprise-grade Web3 application showcasing smart contract security, gas optimization, decentralized trust models, and transparent provenance on Ethereum.
        </p>
      </div>

      {/* Security Principles */}
      <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Smart Contract Security Architecture</h2>
            <p className="text-xs text-slate-400">Hardened against reentrancy attacks and unauthorized access</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ReentrancyGuard Protection</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All state-changing functions (`buyAsset`, `createAndListAsset`, `transferAsset`, `listAsset`) utilize OpenZeppelin&apos;s `nonReentrant` modifier to block malicious call-backs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Checks-Effects-Interactions</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Internal state updates (updating owner, status, volume stats) execute completely BEFORE any external ETH transfers or contract calls occur.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Custom Solidity Errors</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Custom errors (`NotOwner`, `InsufficientPayment`, `AlreadyListed`, `CannotBuyOwnAsset`) replace expensive revert strings to optimize bytecode and gas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ownable Access Control</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Administrative functions (linking marketplace address, emergency controls) are restricted strictly to authorized deployer signatures.
            </p>
          </div>
        </div>
      </section>

      {/* Gas Fee Considerations */}
      <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Gas Fee Considerations & Optimization</h2>
            <p className="text-xs text-slate-400">Minimizing execution costs for on-chain interactions</p>
          </div>
        </div>

        <ul className="space-y-3 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <span><strong>Solidity Compiler Optimizer Enabled:</strong> Compiled with 200 optimization runs to produce lightweight bytecode and minimize runtime gas consumption.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <span><strong>Storage Pointer Efficiency:</strong> Uses `memory` structs in view functions and array iteration to avoid unnecessary `SSTORE` and `SLOAD` operations.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <span><strong>Event Logging Over Storage:</strong> Uses indexed Ethereum log events (`AssetCreated`, `AssetPurchased`, `AssetTransferred`) for low-cost off-chain indexing.</span>
          </li>
        </ul>
      </section>

      {/* Decentralized Trust & Architecture */}
      <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Decentralized Trust & Zero-Database Architecture</h2>
            <p className="text-xs text-slate-400">The blockchain is the single source of truth</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Unlike traditional Web2 applications that store asset records, user portfolios, and listing prices in SQL/NoSQL databases, this DApp relies <strong>100% on the Ethereum blockchain</strong>. Integrated Next.js API Routes serve as serverless helpers reading contract state via Ethers.js v6 JsonRpcProvider directly on Vercel.
        </p>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300 font-mono">
          <span>Database Used: NONE</span>
          <span>Blockchain Source of Truth: ACTIVE</span>
        </div>
      </section>
    </div>
  );
}
