'use client';

import React from 'react';
import Link from 'next/link';
import { Asset } from '../types';
import { formatAddress, formatEth, getCategoryBadgeColor } from '../utils/formatters';
import { useWeb3 } from '../context/Web3Context';
import { ShoppingBag, Eye, Tag, User } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  onBuy?: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onBuy }) => {
  const { account } = useWeb3();
  const isOwner = account && account.toLowerCase() === asset.currentOwner.toLowerCase();

  return (
    <div className="group relative rounded-2xl bg-slate-900/60 border border-slate-800/90 overflow-hidden hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col">
      {/* Asset Image Container */}
      <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
        <img
          src={asset.imageUrl}
          alt={asset.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop';
          }}
        />

        {/* Category & Status Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${getCategoryBadgeColor(
              asset.category
            )}`}
          >
            {asset.category}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md ${
              asset.forSale
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900/80 text-slate-400 border border-slate-700'
            }`}
          >
            {asset.forSale ? 'For Sale' : 'Not Listed'}
          </span>
        </div>

        {/* Token ID Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 font-mono text-[11px] text-slate-300">
          #{asset.tokenId}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
            {asset.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {asset.description || 'No description provided.'}
          </p>
        </div>

        {/* Creator & Owner Info */}
        <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Owner:</span>
            </span>
            <span className="font-mono font-medium text-slate-300">
              {isOwner ? 'You' : formatAddress(asset.currentOwner)}
            </span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">Price</span>
            <span className="text-sm font-extrabold text-white flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-brand-400" />
              {asset.forSale ? formatEth(asset.priceEth) : 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {asset.forSale && !isOwner && onBuy && (
              <button
                onClick={() => onBuy(asset)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy</span>
              </button>
            )}

            <Link
              href={`/assets/${asset.tokenId}`}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
