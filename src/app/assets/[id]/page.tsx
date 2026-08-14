'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';
import { Asset, OwnershipRecord } from '@/types';
import { formatAddress, formatEth, formatDate, getCategoryBadgeColor } from '@/utils/formatters';
import { Modal } from '@/components/Modal';
import {
  Tag,
  User,
  History,
  Send,
  ShoppingBag,
  ArrowLeft,
  XCircle,
  Clock,
  Edit3
} from 'lucide-react';

export default function AssetDetailsPage({ params }: { params: { id: string } }) {
  const tokenId = parseInt(params.id || '0', 10);

  const {
    account,
    getAsset,
    getOwnershipHistory,
    buyAsset,
    listAsset,
    updateListingPrice,
    cancelListing,
    transferAsset,
  } = useWeb3();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<OwnershipRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [isUpdatePriceModalOpen, setIsUpdatePriceModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);

  // Form Inputs
  const [newPriceEth, setNewPriceEth] = useState<string>('0.1');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!tokenId) return;
    try {
      setLoading(true);
      const [assetData, historyData] = await Promise.all([
        getAsset(tokenId),
        getOwnershipHistory(tokenId),
      ]);
      setAsset(assetData);
      setHistory(historyData);
      if (assetData) {
        setNewPriceEth(assetData.priceEth);
      }
    } catch (err) {
      console.error('Error loading asset details:', err);
    } finally {
      setLoading(false);
    }
  }, [tokenId, getAsset, getOwnershipHistory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOwner = account && asset && account.toLowerCase() === asset.currentOwner.toLowerCase();

  const handleBuy = async () => {
    if (!asset) return;
    setActionLoading(true);
    const success = await buyAsset(asset.tokenId, asset.priceEth);
    if (success) await loadData();
    setActionLoading(false);
  };

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    setActionLoading(true);
    const success = await listAsset(asset.tokenId, newPriceEth);
    if (success) {
      setIsListModalOpen(false);
      await loadData();
    }
    setActionLoading(false);
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    setActionLoading(true);
    const success = await updateListingPrice(asset.tokenId, newPriceEth);
    if (success) {
      setIsUpdatePriceModalOpen(false);
      await loadData();
    }
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (!asset) return;
    setActionLoading(true);
    const success = await cancelListing(asset.tokenId);
    if (success) await loadData();
    setActionLoading(false);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !recipientAddress.trim()) return;
    setActionLoading(true);
    const success = await transferAsset(asset.tokenId, recipientAddress.trim());
    if (success) {
      setIsTransferModalOpen(false);
      setRecipientAddress('');
      await loadData();
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-slate-400 font-semibold space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs">Fetching asset details and ownership history from blockchain...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Asset Not Found</h2>
        <p className="text-xs text-slate-400">The requested Token ID #{tokenId} does not exist in the marketplace contract.</p>
        <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-10">
      {/* Navigation Back */}
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      {/* Main Asset Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Image Media Preview */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-4 overflow-hidden">
          <div className="relative aspect-square w-full bg-slate-950 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={asset.imageUrl}
              alt={asset.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop';
              }}
            />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ${getCategoryBadgeColor(asset.category)}`}>
                {asset.category}
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-950/80 text-slate-300 border border-slate-800 backdrop-blur-md">
                Token ID #{asset.tokenId}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Asset Specifications & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-white">{asset.name}</h1>
            <p className="text-xs text-slate-400 leading-relaxed">{asset.description || 'No description provided.'}</p>
          </div>

          {/* Provenance Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Creator</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-200">
                <User className="w-3.5 h-3.5 text-brand-400" />
                <span>{formatAddress(asset.creator)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Current Owner</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-400">
                <User className="w-3.5 h-3.5" />
                <span>{isOwner ? 'You' : formatAddress(asset.currentOwner)}</span>
              </div>
            </div>
          </div>

          {/* Price & Listing Status Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Market Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  asset.forSale
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {asset.forSale ? 'Listed For Sale' : 'Not Listed'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">
                {asset.forSale ? formatEth(asset.priceEth) : 'Not For Sale'}
              </span>
            </div>

            {/* Action Buttons depending on ownership */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  {asset.forSale ? (
                    <>
                      <button
                        onClick={() => setIsUpdatePriceModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-brand-400" />
                        <span>Update Price</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-2 transition-colors"
                      >
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Cancel Listing</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsListModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/30 transition-all"
                    >
                      <Tag className="w-4 h-4" />
                      <span>List Asset For Sale</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4 text-cyan-400" />
                    <span>Transfer Ownership</span>
                  </button>
                </>
              ) : (
                asset.forSale && (
                  <button
                    onClick={handleBuy}
                    disabled={actionLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Purchase Asset ({asset.priceEth} ETH)</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Immutable Ownership History Timeline */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-400" />
            <span>Immutable Ownership History</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {history.length} Event Record(s) On-Chain
          </span>
        </div>

        <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
          {history.map((record, index) => (
            <div key={index} className="relative group">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-brand-500 group-hover:scale-125 transition-transform" />
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {record.eventType}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatDate(record.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    <span className="text-slate-500">From:</span> {record.from === '0x0000000000000000000000000000000000000000' ? 'Zero Address (Mint)' : formatAddress(record.from)}{' '}
                    <span className="text-slate-500">To:</span> {formatAddress(record.to)}
                  </div>
                </div>

                {parseFloat(record.priceEth) > 0 && (
                  <div className="text-right font-mono text-xs font-bold text-emerald-400">
                    {formatEth(record.priceEth)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* List Modal */}
      <Modal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} title="List Asset For Sale">
        <form onSubmit={handleList} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Listing Price in ETH</label>
            <input
              type="number"
              step="0.001"
              required
              min="0.0001"
              value={newPriceEth}
              onChange={(e) => setNewPriceEth(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono font-bold"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl"
          >
            Confirm & List Asset
          </button>
        </form>
      </Modal>

      {/* Update Price Modal */}
      <Modal isOpen={isUpdatePriceModalOpen} onClose={() => setIsUpdatePriceModalOpen(false)} title="Update Listing Price">
        <form onSubmit={handleUpdatePrice} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">New Price in ETH</label>
            <input
              type="number"
              step="0.001"
              required
              min="0.0001"
              value={newPriceEth}
              onChange={(e) => setNewPriceEth(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono font-bold"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl"
          >
            Update Listing Price
          </button>
        </form>
      </Modal>

      {/* Transfer Ownership Modal */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Transfer Asset Ownership">
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">Recipient Wallet Address (0x...)</label>
            <input
              type="text"
              required
              placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl"
          >
            Transfer Token Ownership
          </button>
        </form>
      </Modal>
    </div>
  );
}
