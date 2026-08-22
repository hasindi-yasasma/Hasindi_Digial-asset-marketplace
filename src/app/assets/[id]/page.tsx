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
        if (assetData.forSale && parseFloat(assetData.priceEth) > 0) {
          setNewPriceEth(assetData.priceEth);
        } else {
          setNewPriceEth('0.1');
        }
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
        <h2 className="text-2xl font-black text-slate-900">Asset Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">The requested Token ID #{tokenId} does not exist in the marketplace contract.</p>
        <Link href="/marketplace" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-xs font-extrabold shadow-md shadow-emerald-500/20">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-10">
      {/* Navigation Back */}
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      {/* Main Asset Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Image Media Preview */}
        <div className="rounded-3xl bg-white/90 border border-slate-200/80 p-4 space-y-4 overflow-hidden shadow-lg shadow-slate-200/50">
          <div className="relative aspect-square w-full bg-slate-100 rounded-2xl overflow-hidden shadow-sm">
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
              <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border backdrop-blur-md shadow-sm ${getCategoryBadgeColor(asset.category)}`}>
                {asset.category}
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-extrabold bg-white/90 text-slate-800 border border-slate-200 backdrop-blur-md shadow-sm">
                Token ID #{asset.tokenId}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Asset Specifications & Actions */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">{asset.name}</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{asset.description || 'No description provided.'}</p>
          </div>

          {/* Provenance Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-400">Creator</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatAddress(asset.creator)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-extrabold text-slate-400">Current Owner</span>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-600">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isOwner ? 'You' : formatAddress(asset.currentOwner)}</span>
              </div>
            </div>
          </div>

          {/* Price & Listing Status Box */}
          <div className="p-6 rounded-3xl bg-white/90 border border-slate-200/80 space-y-4 shadow-lg shadow-slate-200/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Market Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${asset.forSale
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
              >
                {asset.forSale ? 'Listed For Sale' : 'Not Listed'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">
                {asset.forSale ? formatEth(asset.priceEth) : 'Not For Sale'}
              </span>
            </div>

            {/* Action Buttons depending on ownership */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  {asset.forSale ? (
                    <>
                      <button
                        onClick={() => {
                          setNewPriceEth(asset.priceEth || '0.1');
                          setIsUpdatePriceModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-2 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-slate-600" />
                        <span>Update Price</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-extrabold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>Cancel Listing</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setNewPriceEth(asset.priceEth && parseFloat(asset.priceEth) > 0 ? asset.priceEth : '0.1');
                        setIsListModalOpen(true);
                      }}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <Tag className="w-4 h-4" />
                      <span>List Asset For Sale</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4 text-slate-500" />
                    <span>Transfer Ownership</span>
                  </button>
                </>
              ) : (
                asset.forSale && (
                  <button
                    onClick={handleBuy}
                    disabled={actionLoading || !account}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{actionLoading ? 'Purchasing...' : `Buy Asset for ${formatEth(asset.priceEth)}`}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History & Timeline Section */}
      <div className="rounded-3xl bg-white/90 border border-slate-200/80 p-6 md:p-8 space-y-6 shadow-lg shadow-slate-200/50">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-500" />
          <span>Provenance & Ownership History</span>
        </h2>

        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
          {history.length === 0 && (
            <p className="text-xs text-slate-500 font-medium">No ownership events recorded yet.</p>
          )}

          {history.map((record, index) => (
            <div key={index} className="relative group">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 group-hover:scale-125 transition-transform" />
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {record.eventType}
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDate(record.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-700">
                    <span className="text-slate-400">From:</span> {record.from === '0x0000000000000000000000000000000000000000' ? 'Zero Address (Mint)' : formatAddress(record.from)}{' '}
                    <span className="text-slate-400">To:</span> {formatAddress(record.to)}
                  </div>
                </div>

                {parseFloat(record.priceEth) > 0 && (
                  <div className="text-right font-mono text-xs font-black text-emerald-600">
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
              step="any"
              required
              min="0.000000000000000001"
              placeholder="e.g. 0.001"
              value={newPriceEth}
              onChange={(e) => setNewPriceEth(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {actionLoading ? 'Confirming On-Chain...' : 'Confirm & List Asset'}
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
              step="any"
              required
              min="0.000000000000000001"
              placeholder="e.g. 0.001"
              value={newPriceEth}
              onChange={(e) => setNewPriceEth(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {actionLoading ? 'Updating On-Chain...' : 'Update Listing Price'}
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
          >
            {actionLoading ? 'Transferring On-Chain...' : 'Transfer Token Ownership'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
