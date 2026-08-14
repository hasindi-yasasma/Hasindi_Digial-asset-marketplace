'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/context/Web3Context';
import { PlusCircle, Image as ImageIcon, Tag, AlertCircle } from 'lucide-react';

export default function CreateAssetPage() {
  const router = useRouter();
  const { account, connectWallet, createAndListAsset } = useWeb3();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Art');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [priceEth, setPriceEth] = useState<string>('0.1');
  const [forSale, setForSale] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const categories = ['Art', 'Collectibles', 'Gaming', 'Virtual Real Estate', 'Music', 'Photography'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      connectWallet();
      return;
    }

    if (!name.trim() || !imageUrl.trim()) {
      return;
    }

    if (forSale && (isNaN(parseFloat(priceEth)) || parseFloat(priceEth) <= 0)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await createAndListAsset(
        name.trim(),
        description.trim(),
        category,
        imageUrl.trim(),
        forSale ? priceEth : '0',
        forSale
      );

      if (success) {
        router.push('/marketplace');
      }
    } catch (err) {
      console.error('Asset creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <PlusCircle className="w-8 h-8 text-brand-400" />
          <span>Mint Digital Asset NFT</span>
        </h1>
        <p className="text-xs text-slate-400">
          Register a new digital asset on the Ethereum blockchain. Mint an ERC-721 token representing full ownership.
        </p>
      </div>

      {!account && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-200 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Connect your MetaMask wallet to mint digital assets on-chain.</span>
          </div>
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
          {/* Asset Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Asset Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cyberpunk Hologram Avatar #001"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the asset attributes, backstory, or rarity details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Category <span className="text-rose-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Image URL <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com/asset-image.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* For Sale Checkbox & Price Input */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-slate-200">List Immediately for Sale</span>
              <input
                type="checkbox"
                checked={forSale}
                onChange={(e) => setForSale(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
              />
            </label>

            {forSale && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Listing Price (ETH) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    required={forSale}
                    placeholder="0.1"
                    value={priceEth}
                    onChange={(e) => setPriceEth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !account}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{isSubmitting ? 'Minting NFT Token...' : 'Mint & Register Asset'}</span>
          </button>
        </form>

        {/* Live Preview Card */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-brand-400" />
            <span>Live Asset Preview</span>
          </h3>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-4 overflow-hidden">
            <div className="relative aspect-square w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Asset Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center text-slate-600 text-xs gap-2">
                  <ImageIcon className="w-10 h-10" />
                  <span>Enter Image URL above</span>
                </div>
              )}

              <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/40 backdrop-blur-md">
                {category}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-extrabold text-white text-base">
                {name || 'Untitled Digital Asset'}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2">
                {description || 'No asset description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Listing Price</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {forSale ? `${priceEth} ETH` : 'Not Listed'}
                </span>
              </div>

              <div className="px-3 py-1 rounded-lg bg-slate-950 text-xs font-mono text-slate-400 border border-slate-800">
                Token ID #Auto
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
