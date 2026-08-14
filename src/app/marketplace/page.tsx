'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { Asset } from '@/types';
import { AssetCard } from '@/components/AssetCard';
import { AssetCardSkeleton } from '@/components/Skeleton';
import { Search, Filter, ArrowUpDown, ShoppingBag, X } from 'lucide-react';

export default function MarketplacePage() {
  const { getAllAssets, buyAsset, account } = useWeb3();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [forSaleOnly, setForSaleOnly] = useState<boolean>(false);
  const [ownedByMeOnly, setOwnedByMeOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc'>('newest');

  const categories = ['All', 'Art', 'Collectibles', 'Gaming', 'Virtual Real Estate', 'Music', 'Photography'];

  const loadAssets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllAssets();
      setAssets(data);
    } catch (err) {
      console.error('Error fetching marketplace assets:', err);
    } finally {
      setLoading(false);
    }
  }, [getAllAssets]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        const matchSearch =
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.currentOwner.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.tokenId.toString() === searchQuery;

        const matchCategory =
          selectedCategory === 'All' ||
          asset.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchForSale = !forSaleOnly || asset.forSale;

        const matchOwned =
          !ownedByMeOnly ||
          (account && asset.currentOwner.toLowerCase() === account.toLowerCase());

        return matchSearch && matchCategory && matchForSale && matchOwned;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.createdAt - a.createdAt;
        if (sortBy === 'oldest') return a.createdAt - b.createdAt;
        if (sortBy === 'price-asc') return parseFloat(a.priceEth) - parseFloat(b.priceEth);
        if (sortBy === 'price-desc') return parseFloat(b.priceEth) - parseFloat(a.priceEth);
        return 0;
      });
  }, [assets, searchQuery, selectedCategory, forSaleOnly, ownedByMeOnly, sortBy, account]);

  const handleBuy = async (asset: Asset) => {
    const success = await buyAsset(asset.tokenId, asset.priceEth);
    if (success) {
      loadAssets();
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-brand-400" />
          <span>Explore Digital Marketplace</span>
        </h1>
        <p className="text-xs text-slate-400">
          Browse, filter, and purchase unique ERC-721 digital asset tokens on-chain
        </p>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, description, owner or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Toggles (For Sale / Owned) */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={forSaleOnly}
                onChange={(e) => setForSaleOnly(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-brand-500"
              />
              <span>For Sale Only</span>
            </label>

            {account && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ownedByMeOnly}
                  onChange={(e) => setOwnedByMeOnly(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-brand-600 focus:ring-brand-500"
                />
                <span>Owned by Me</span>
              </label>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Assets */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AssetCardSkeleton />
          <AssetCardSkeleton />
          <AssetCardSkeleton />
          <AssetCardSkeleton />
        </div>
      ) : filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.tokenId} asset={asset} onBuy={handleBuy} />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <p className="text-slate-400 text-sm font-semibold">No digital assets match your filter criteria.</p>
          <p className="text-xs text-slate-500">Try adjusting your search query, category selection, or for-sale toggles.</p>
        </div>
      )}
    </div>
  );
}
