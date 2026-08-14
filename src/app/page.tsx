'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';
import { Asset, DashboardStats } from '@/types';
import { AssetCard } from '@/components/AssetCard';
import { AssetCardSkeleton } from '@/components/Skeleton';
import { formatEth } from '@/utils/formatters';
import {
  Sparkles,
  ShoppingBag,
  PlusCircle,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  const { getAllAssets, getDashboardStats, buyAsset } = useWeb3();
  const [featuredAssets, setFeaturedAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [assetsList, dashboardStats] = await Promise.all([
          getAllAssets(),
          getDashboardStats(),
        ]);
        setFeaturedAssets(assetsList.slice(0, 6));
        setStats(dashboardStats);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [getAllAssets, getDashboardStats]);

  const handleBuy = async (asset: Asset) => {
    await buyAsset(asset.tokenId, asset.priceEth);
    const updated = await getAllAssets();
    setFeaturedAssets(updated.slice(0, 6));
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Decentralized Asset Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Discover, Mint & Trade <br />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Digital Assets On-Chain
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            A 100% decentralized digital marketplace powered by Solidity smart contracts and Ethereum. Zero database reliance — every asset, transfer, and transaction history is immutably verified on the blockchain.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-[1.02]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/create"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-bold text-sm transition-all"
            >
              <PlusCircle className="w-5 h-5 text-brand-400" />
              <span>Mint New Asset</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-xs font-semibold text-slate-400 uppercase">Total Assets</span>
            <span className="text-xl font-extrabold text-white mt-1 block">
              {stats ? stats.totalAssets : '...'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-xs font-semibold text-slate-400 uppercase">For Sale</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
              {stats ? stats.assetsForSale : '...'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-xs font-semibold text-slate-400 uppercase">Volume</span>
            <span className="text-xl font-extrabold text-cyan-400 mt-1 block">
              {stats ? formatEth(stats.totalVolumeEth) : '...'}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-xs font-semibold text-slate-400 uppercase">Unique Owners</span>
            <span className="text-xl font-extrabold text-purple-400 mt-1 block">
              {stats ? stats.uniqueOwnersCount : '...'}
            </span>
          </div>
        </div>
      </section>

      {/* Featured Digital Assets Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-brand-400" />
              <span>Featured Digital Assets</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Explore recently minted tokens available for acquisition</p>
          </div>

          <Link
            href="/marketplace"
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AssetCardSkeleton />
            <AssetCardSkeleton />
            <AssetCardSkeleton />
          </div>
        ) : featuredAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAssets.map((asset) => (
              <AssetCard key={asset.tokenId} asset={asset} onBuy={handleBuy} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <p className="text-slate-400 text-sm">No digital assets have been minted yet.</p>
            <Link
              href="/create"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Mint the First Asset</span>
            </Link>
          </div>
        )}
      </section>

      {/* Platform Features / Security Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Reentrancy Protection</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Marketplace smart contract inherits OpenZeppelin ReentrancyGuard and follows the strict Checks-Effects-Interactions design pattern.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Gas-Efficient Storage</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Solidity compiler optimization enabled with 200 runs, custom error revert messages, and packed storage structs.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Immutable Provenance</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Complete lifecycle recording on-chain (Mint, List, Sale, Transfer, Cancel, Price Update) accessible anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
