'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';
import { OwnershipRecord } from '@/types';
import { formatAddress, formatEth, formatDate } from '@/utils/formatters';
import { History, Filter, ArrowRight } from 'lucide-react';

export default function HistoryPage() {
  const { getAllTransactions } = useWeb3();
  const [transactions, setTransactions] = useState<OwnershipRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('All');

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTransactions();
      setTransactions(data.reverse());
    } catch (err) {
      console.error('Error fetching transaction history:', err);
    } finally {
      setLoading(false);
    }
  }, [getAllTransactions]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const eventTypes = ['All', 'Mint', 'List', 'Sale', 'Transfer', 'Cancel', 'PriceUpdate'];

  const filteredTransactions = useMemo(() => {
    if (filterType === 'All') return transactions;
    return transactions.filter((tx) => tx.eventType.toLowerCase() === filterType.toLowerCase());
  }, [transactions, filterType]);

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <History className="w-8 h-8 text-brand-400" />
          <span>Blockchain Event Ledger</span>
        </h1>
        <p className="text-xs text-slate-400">
          Complete transparent history of all smart contract events (Minting, Purchases, Direct Transfers, Listings, Price Updates)
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0 mr-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Event Filter:</span>
        </span>
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              filterType === type
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Token ID</th>
                <th className="px-6 py-4">From</th>
                <th className="px-6 py-4">To</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Loading blockchain events...
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                          tx.eventType === 'Mint'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : tx.eventType === 'Sale'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : tx.eventType === 'List'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : tx.eventType === 'Transfer'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {tx.eventType}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-white">
                      #{tx.tokenId}
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-300">
                      {tx.from === '0x0000000000000000000000000000000000000000'
                        ? '0x00...00 (Mint)'
                        : formatAddress(tx.from)}
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-300">
                      {formatAddress(tx.to)}
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      {parseFloat(tx.priceEth) > 0 ? formatEth(tx.priceEth) : '—'}
                    </td>

                    <td className="px-6 py-4 text-slate-400 font-mono">
                      {formatDate(tx.timestamp)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/assets/${tx.tokenId}`}
                        className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold text-xs"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No transactions recorded under &quot;{filterType}&quot;.
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
