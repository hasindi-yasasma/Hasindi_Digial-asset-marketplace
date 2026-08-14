'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { Asset, OwnershipRecord } from '@/types';
import { AssetCard } from '@/components/AssetCard';
import { AssetCardSkeleton } from '@/components/Skeleton';
import { Coins, Package, Tag, ShoppingBag, ArrowUpRight, Wallet } from 'lucide-react';

export default function MyAssetsPage() {
  const { account, connectWallet, getAllAssets, getAllTransactions, buyAsset } = useWeb3();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<OwnershipRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'owned' | 'created' | 'listed' | 'purchased' | 'sold'>('owned');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [allAssets, allTx] = await Promise.all([
        getAllAssets(),
        getAllTransactions(),
      ]);
      setAssets(allAssets);
      setTransactions(allTx);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  }, [getAllAssets, getAllTransactions]);

  useEffect(() => {
    loadData();
  }, [loadData, account]);

  // Tab Filtering Logic
  const ownedAssets = useMemo(() => {
    if (!account) return [];
    return assets.filter((a) => a.currentOwner.toLowerCase() === account.toLowerCase());
  }, [assets, account]);

  const createdAssets = useMemo(() => {
    if (!account) return [];
    return assets.filter((a) => a.creator.toLowerCase() === account.toLowerCase());
  }, [assets, account]);

  const listedAssets = useMemo(() => {
    if (!account) return [];
    return assets.filter((a) => a.currentOwner.toLowerCase() === account.toLowerCase() && a.forSale);
  }, [assets, account]);

  const purchasedTokenIds = useMemo(() => {
    if (!account) return new Set<number>();
    const set = new Set<number>();
    transactions.forEach((tx) => {
      if (tx.eventType === 'Sale' && tx.to.toLowerCase() === account.toLowerCase()) {
        set.add(tx.tokenId);
      }
    });
    return set;
  }, [transactions, account]);

  const purchasedAssets = useMemo(() => {
    return assets.filter((a) => purchasedTokenIds.has(a.tokenId));
  }, [assets, purchasedTokenIds]);

  const soldTokenIds = useMemo(() => {
    if (!account) return new Set<number>();
    const set = new Set<number>();
    transactions.forEach((tx) => {
      if (tx.eventType === 'Sale' && tx.from.toLowerCase() === account.toLowerCase()) {
        set.add(tx.tokenId);
      }
    });
    return set;
  }, [transactions, account]);

  const soldAssets = useMemo(() => {
    return assets.filter((a) => soldTokenIds.has(a.tokenId));
  }, [assets, soldTokenIds]);

  const displayedAssets = useMemo(() => {
    switch (activeTab) {
      case 'owned':
        return ownedAssets;
      case 'created':
        return createdAssets;
      case 'listed':
        return listedAssets;
      case 'purchased':
        return purchasedAssets;
      case 'sold':
        return soldAssets;
      default:
        return ownedAssets;
    }
  }, [activeTab, ownedAssets, createdAssets, listedAssets, purchasedAssets, soldAssets]);

  const handleBuy = async (asset: Asset) => {
    const success = await buyAsset(asset.tokenId, asset.priceEth);
    if (success) loadData();
  };

  if (!account) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
          <Wallet className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Wallet Not Connected</h2>
        <p className="text-xs text-slate-400">
          Connect your MetaMask wallet to view your owned, created, listed, purchased, and sold digital assets.
        </p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30"
        >
          Connect MetaMask Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Coins className="w-8 h-8 text-brand-400" />
          <span>My Portfolio</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage your owned tokens, created digital assets, active listings, and sale records
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('owned')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'owned'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Owned ({ownedAssets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('created')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'created'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Created ({createdAssets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('listed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'listed'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Listed for Sale ({listedAssets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('purchased')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'purchased'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Purchased ({purchasedAssets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sold')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'sold'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Sold ({soldAssets.length})</span>
        </button>
      </div>

      {/* Grid of Displayed Assets */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AssetCardSkeleton />
          <AssetCardSkeleton />
        </div>
      ) : displayedAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedAssets.map((asset) => (
            <AssetCard key={asset.tokenId} asset={asset} onBuy={handleBuy} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <p className="text-slate-400 text-xs font-semibold">No assets found under &quot;{activeTab}&quot; category.</p>
        </div>
      )}
    </div>
  );
}
