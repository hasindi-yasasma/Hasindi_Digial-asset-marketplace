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
    <div className="group relative rounded-3xl bg-white/90 border border-slate-200/80 overflow-hidden hover:border-emerald-400/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col">
      {/* Asset Image Container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
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
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold border backdrop-blur-md shadow-sm ${getCategoryBadgeColor(
              asset.category
            )}`}
          >
            {asset.category}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold backdrop-blur-md shadow-sm ${
              asset.forSale
                ? 'bg-emerald-500/90 text-white border border-emerald-400'
                : 'bg-slate-900/80 text-slate-200 border border-slate-700'
            }`}
          >
            {asset.forSale ? 'For Sale' : 'Not Listed'}
          </span>
        </div>

        {/* Token ID Badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 font-mono text-[11px] font-bold text-slate-800 shadow-sm">
          #{asset.tokenId}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
            {asset.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed font-medium">
            {asset.description || 'No description provided.'}
          </p>
        </div>

        {/* Creator & Owner Info */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Owner:</span>
            </span>
            <span className="font-mono font-bold text-slate-800">
              {isOwner ? 'You' : formatAddress(asset.currentOwner)}
            </span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Price</span>
            <span className="text-base font-black text-slate-900 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              {asset.forSale ? formatEth(asset.priceEth) : 'N/A'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {asset.forSale && !isOwner && onBuy && (
              <button
                onClick={() => onBuy(asset)}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy</span>
              </button>
            )}

            <Link
              href={`/assets/${asset.tokenId}`}
              className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
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
