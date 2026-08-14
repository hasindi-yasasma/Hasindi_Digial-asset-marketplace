'use client';

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { DashboardStats, HolderInfo, OwnershipRecord } from '@/types';
import { StatsCard } from '@/components/StatsCard';
import { StatsCardSkeleton } from '@/components/Skeleton';
import { formatAddress, formatEth, formatDate } from '@/utils/formatters';
import {
  BarChart3,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Coins,
  Award,
  History,
  Crown
} from 'lucide-react';

export default function AnalyticsPage() {
  const { getDashboardStats, getTopHolders, getAllTransactions } = useWeb3();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topHolders, setTopHolders] = useState<HolderInfo[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<OwnershipRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [dashStats, holders, txs] = await Promise.all([
          getDashboardStats(),
          getTopHolders(),
          getAllTransactions(),
        ]);
        setStats(dashStats);
        setTopHolders(holders);
        setRecentTransactions(txs.slice(-5).reverse());
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [getDashboardStats, getTopHolders, getAllTransactions]);

  return (
    <div className="space-y-10 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-brand-400" />
          <span>Marketplace Analytics Dashboard</span>
        </h1>
        <p className="text-xs text-slate-400">
          Real-time metrics, total trading volume, top asset holder rankings, and blockchain stats
        </p>
      </div>

      {/* Metrics Cards Grid */}
      {loading || !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Assets Created"
            value={stats.totalAssets}
            subtitle="Registered digital NFT tokens"
            icon={Package}
            color="indigo"
          />
          <StatsCard
            title="Assets For Sale"
            value={stats.assetsForSale}
            subtitle="Active marketplace listings"
            icon={ShoppingBag}
            color="emerald"
          />
          <StatsCard
            title="Total Assets Sold"
            value={stats.assetsSold}
            subtitle="Successful purchases"
            icon={TrendingUp}
            color="cyan"
          />
          <StatsCard
            title="Total Transactions"
            value={stats.totalTransactions}
            subtitle="On-chain smart contract events"
            icon={History}
            color="purple"
          />
          <StatsCard
            title="Unique Owners"
            value={stats.uniqueOwnersCount}
            subtitle="Distinct holder wallet addresses"
            icon={Users}
            color="amber"
          />
          <StatsCard
            title="Marketplace Volume"
            value={formatEth(stats.totalVolumeEth)}
            subtitle="Cumulative ETH trading volume"
            icon={Coins}
            color="emerald"
          />
          <StatsCard
            title="Highest Value Asset"
            value={formatEth(stats.highestValueAssetPriceEth)}
            subtitle="Peak listing price recorded"
            icon={Award}
            color="rose"
          />
        </div>
      )}

      {/* Top 10 Asset Holders Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>Top 10 Asset Holders</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Leaderboard</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Holder Address</th>
                  <th className="px-4 py-3">Tokens Held</th>
                  <th className="px-4 py-3 text-right">Ownership Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {topHolders.length > 0 ? (
                  topHolders.map((item, index) => {
                    const share = stats && stats.totalAssets > 0
                      ? ((item.assetCount / stats.totalAssets) * 100).toFixed(1)
                      : '0.0';
                    return (
                      <tr key={item.holder} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-extrabold text-slate-300">
                          {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-white">
                          {formatAddress(item.holder)}
                        </td>
                        <td className="px-4 py-3 font-bold text-brand-400">
                          {item.assetCount} NFT(s)
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-300">
                          {share}%
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-medium">
                      No holders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Activity Side Panel */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-brand-400" />
              <span>Latest Activity</span>
            </h2>
          </div>

          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold uppercase text-brand-400">{tx.eventType}</span>
                    <span className="font-mono text-slate-500">{formatDate(tx.timestamp)}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    Token #{tx.tokenId} • {parseFloat(tx.priceEth) > 0 ? formatEth(tx.priceEth) : 'Transfer/Mint'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No recent transactions.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
