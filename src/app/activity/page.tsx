'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';
import { OwnershipRecord } from '@/types';
import { formatAddress, formatEth, formatDate } from '@/utils/formatters';
import { Activity, ArrowLeft, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';

export default function ActivityPage() {
  const { getAllTransactions, getAllAssets } = useWeb3();
  const [transactions, setTransactions] = useState<OwnershipRecord[]>([]);
  const [assetMap, setAssetMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('All Events');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [txData, assetsData] = await Promise.all([
        getAllTransactions(),
        getAllAssets(),
      ]);

      // Map tokenId -> asset name
      const map = new Map<number, string>();
      assetsData.forEach((asset) => {
        map.set(asset.tokenId, asset.name);
      });
      setAssetMap(map);

      // Newest transactions first
      setTransactions([...txData].reverse());
    } catch (err) {
      console.error('Error fetching activity log data:', err);
    } finally {
      setLoading(false);
    }
  }, [getAllTransactions, getAllAssets]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => {
      setCopiedAddress(null);
    }, 2000);
  };

  const filterTabs = ['All Events', 'Minted', 'Listed', 'Purchased', 'Transferred', 'Cancelled', 'Price Updated'];

  const filteredTransactions = useMemo(() => {
    if (filterType === 'All Events') return transactions;
    
    return transactions.filter((tx) => {
      const type = tx.eventType.toLowerCase();
      switch (filterType) {
        case 'Minted':
          return type === 'mint';
        case 'Listed':
          return type === 'list';
        case 'Purchased':
          return type === 'sale' || type === 'purchased';
        case 'Transferred':
          return type === 'transfer';
        case 'Cancelled':
          return type === 'cancel';
        case 'Price Updated':
          return type === 'priceupdate';
        default:
          return true;
      }
    });
  }, [transactions, filterType]);

  const getEventBadgeStyle = (eventType: string) => {
    const lower = eventType.toLowerCase();
    if (lower === 'mint') {
      return { label: 'Minted', style: 'bg-teal-500/15 text-teal-400 border-teal-500/30' };
    }
    if (lower === 'list') {
      return { label: 'Listed', style: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    }
    if (lower === 'sale' || lower === 'purchased') {
      return { label: 'Purchased', style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    }
    if (lower === 'transfer') {
      return { label: 'Transferred', style: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
    }
    if (lower === 'cancel') {
      return { label: 'Cancelled', style: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
    }
    if (lower === 'priceupdate') {
      return { label: 'Price Updated', style: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
    }
    return { label: eventType, style: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  };

  const isZeroAddress = (addr: string) => {
    if (!addr) return true;
    return addr.toLowerCase() === '0x0000000000000000000000000000000000000000';
  };

  return (
    <div className="min-h-screen space-y-6 py-6 px-2 sm:px-4">
      {/* Top Back Button */}
      <div>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Activity &amp; Transactions Log</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Complete, Immutable chronological log of every action executed on the AssetChain smart contract.
            </p>
          </div>
        </div>

        {/* Right total count & Refresh button */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <button
            onClick={loadData}
            title="Refresh transactions"
            disabled={loading}
            className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-400 font-bold shadow-inner">
            Total Events: <span className="text-white font-extrabold">{transactions.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs matching reference design */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-800/80 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = filterType === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 transition-all ${
                isActive
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/25 border border-teal-400'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/90'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Transactions Table matching reference design */}
      <div className="rounded-2xl sm:rounded-3xl bg-slate-950/90 border border-slate-800/90 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800/90">
              <tr>
                <th className="px-6 py-4">EVENT</th>
                <th className="px-6 py-4">ASSET</th>
                <th className="px-6 py-4">FROM</th>
                <th className="px-6 py-4">TO</th>
                <th className="px-6 py-4">VALUE</th>
                <th className="px-6 py-4">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
                      <span>Loading blockchain activity log...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, idx) => {
                  const badge = getEventBadgeStyle(tx.eventType);
                  const assetName = assetMap.get(tx.tokenId);
                  const displayAssetName = assetName ? assetName : `Asset`;

                  return (
                    <tr key={idx} className="hover:bg-slate-900/50 transition-colors group">
                      {/* Event Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${badge.style}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Asset Title with Token ID */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/assets/${tx.tokenId}`}
                          className="font-bold text-white hover:text-teal-400 transition-colors flex items-center gap-1.5"
                        >
                          <span>{displayAssetName}</span>
                          <span className="text-slate-400 font-mono font-normal">
                            (#{tx.tokenId})
                          </span>
                        </Link>
                      </td>

                      {/* From Address */}
                      <td className="px-6 py-4">
                        {isZeroAddress(tx.from) ? (
                          <span className="text-slate-500 font-mono">—</span>
                        ) : (
                          <div className="flex items-center gap-2 font-mono text-slate-300">
                            <span>{formatAddress(tx.from)}</span>
                            <button
                              onClick={() => copyToClipboard(tx.from)}
                              title="Copy address"
                              className="text-slate-500 hover:text-teal-400 transition-colors"
                            >
                              {copiedAddress === tx.from ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={`https://sepolia.etherscan.io/address/${tx.from}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View on Etherscan"
                              className="text-slate-500 hover:text-teal-400 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </td>

                      {/* To Address */}
                      <td className="px-6 py-4">
                        {isZeroAddress(tx.to) ? (
                          <span className="text-slate-500 font-mono">—</span>
                        ) : (
                          <div className="flex items-center gap-2 font-mono text-slate-300">
                            <span>{formatAddress(tx.to)}</span>
                            <button
                              onClick={() => copyToClipboard(tx.to)}
                              title="Copy address"
                              className="text-slate-500 hover:text-teal-400 transition-colors"
                            >
                              {copiedAddress === tx.to ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <a
                              href={`https://sepolia.etherscan.io/address/${tx.to}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View on Etherscan"
                              className="text-slate-500 hover:text-teal-400 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Value ETH */}
                      <td className="px-6 py-4 font-mono font-black text-amber-400">
                        {parseFloat(tx.priceEth) > 0 ? (
                          `${parseFloat(tx.priceEth)} ETH`
                        ) : (
                          <span className="text-slate-500 font-normal">—</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {formatDate(tx.timestamp)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 font-medium">
                    No activity recorded under &quot;{filterType}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
