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
    <div className="space-y-16 py-4">
      {/* Hero Banner Section matching reference image */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-emerald-50/40 to-teal-50/60 border border-slate-200/80 p-8 sm:p-12 lg:p-16 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
        {/* Decorative Background Swashes */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Hero Copy & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Decentralized Asset Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Make Digital <br />
              <span className="text-emerald-500">Asset Trading</span> <br />
              with Our <span className="text-emerald-500">Marketplace</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-xl">
              Discover, mint, and trade verified ERC-721 digital tokens on Ethereum Sepolia. Powered by immutable smart contract logic and zero centralized database dependency.
            </p>

            {/* Quick Pill Actions matching reference email/input design */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-white rounded-full border border-slate-200/80 shadow-xl shadow-slate-200/60 max-w-md">
                <div className="flex items-center gap-2 px-4 py-2 text-slate-400 w-full">
                  <ShoppingBag className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-600">Explore 100% On-Chain Assets</span>
                </div>
                <Link
                  href="/marketplace"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all text-center whitespace-nowrap"
                >
                  Explore Now
                </Link>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4 text-xs font-bold text-slate-500">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Mint New Digital Asset</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Showcase Container matching reference image style */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Organic curved yellow accent line representation */}
            <svg
              className="absolute -bottom-6 -left-6 w-48 h-48 text-amber-400 opacity-80 pointer-events-none"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 150 C 60 100, 140 180, 190 100"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>

            {/* Main Showcase Image Box with Curved Cutout Accent */}
            <div className="relative w-full max-w-sm aspect-square rounded-[2.5rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 p-1 shadow-2xl shadow-emerald-500/20 group">
              <div className="w-full h-full bg-slate-900 rounded-[2.3rem] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop"
                  alt="Featured Hero Asset"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />

                {/* Floating 3D/Glass Badges */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-100 shadow-md font-mono text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>ERC-721 Token</span>
                </div>

                <div className="absolute bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-full font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
                  <span>Verified On-Chain</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
            <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Assets</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats ? stats.totalAssets : '...'}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
            <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">For Sale</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {stats ? stats.assetsForSale : '...'}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
            <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Volume</span>
            <span className="text-2xl font-black text-teal-600 mt-1 block">
              {stats ? formatEth(stats.totalVolumeEth) : '...'}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
            <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Unique Owners</span>
            <span className="text-2xl font-black text-purple-600 mt-1 block">
              {stats ? stats.uniqueOwnersCount : '...'}
            </span>
          </div>
        </div>
      </section>

      {/* Featured Digital Assets Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <span>Featured Digital Assets</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Explore recently minted tokens available for acquisition</p>
          </div>

          <Link
            href="/marketplace"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
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
          <div className="p-12 text-center rounded-3xl bg-white/90 border border-slate-200/80 shadow-md">
            <p className="text-slate-500 text-sm font-medium">No digital assets have been minted yet.</p>
            <Link
              href="/create"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Mint the First Asset</span>
            </Link>
          </div>
        )}
      </section>

      {/* Platform Features / Security Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-white/90 border border-slate-200/80 p-6 space-y-3 shadow-lg shadow-slate-200/40">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 w-fit shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">Reentrancy Protection</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Marketplace smart contract inherits OpenZeppelin ReentrancyGuard and follows the strict Checks-Effects-Interactions design pattern.
          </p>
        </div>

        <div className="rounded-3xl bg-white/90 border border-slate-200/80 p-6 space-y-3 shadow-lg shadow-slate-200/40">
          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 w-fit shadow-sm">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">Gas-Efficient Storage</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Solidity compiler optimization enabled with 200 runs, custom error revert messages, and packed storage structs.
          </p>
        </div>

        <div className="rounded-3xl bg-white/90 border border-slate-200/80 p-6 space-y-3 shadow-lg shadow-slate-200/40">
          <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 w-fit shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900">Immutable Provenance</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Complete lifecycle recording on-chain (Mint, List, Sale, Transfer, Cancel, Price Update) accessible anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
