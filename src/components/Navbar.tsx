'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWeb3 } from '../context/Web3Context';
import { formatAddress } from '../utils/formatters';
import {
  Coins,
  PlusCircle,
  ShoppingBag,
  History,
  BarChart3,
  Info,
  Wallet,
  LogOut,
  AlertTriangle,
  Menu,
  X,
  Layers
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    account,
    balance,
    networkName,
    isConnecting,
    isWrongNetwork,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWeb3();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home', icon: Layers },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { path: '/create', label: 'Create Asset', icon: PlusCircle },
    { path: '/my-assets', label: 'My Assets', icon: Coins },
    { path: '/history', label: 'History', icon: History },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      {isWrongNetwork && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Wrong network connected ({networkName}). Please switch to Ethereum Sepolia.</span>
          </div>
          <button
            onClick={switchNetwork}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-md transition-colors"
          >
            Switch Network
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Coins className="w-5 h-5 text-brand-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AssetChain
              </span>
              <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
                Digital Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Wallet Connection Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Network Indicator Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  account ? (isWrongNetwork ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse') : 'bg-slate-600'
                }`}
              />
              <span className="text-slate-300">{networkName}</span>
            </div>

            {account ? (
              <div className="flex items-center gap-2">
                {/* Account & Balance Badge */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Balance</span>
                    <span className="text-xs font-bold text-emerald-400">{balance} ETH</span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-white bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                    <Wallet className="w-3.5 h-3.5 text-brand-400" />
                    <span>{formatAddress(account)}</span>
                  </div>
                </div>

                <button
                  onClick={disconnectWallet}
                  title="Disconnect Wallet"
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800">
            {account ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold text-white">
                    <Wallet className="w-4 h-4 text-brand-400" />
                    <span>{formatAddress(account)}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{balance} ETH</span>
                </div>
                <button
                  onClick={() => {
                    disconnectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 font-semibold text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-600/30"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect MetaMask</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
