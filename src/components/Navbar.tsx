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
  Activity,
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
    { path: '/activity', label: 'Activity', icon: Activity },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl transition-all shadow-sm">
      {isWrongNetwork && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-800 px-4 py-2 text-xs flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Wrong network connected ({networkName}). Please switch to Ethereum Sepolia.</span>
          </div>
          <button
            onClick={switchNetwork}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full transition-colors shadow-sm"
          >
            Switch Network
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Coins className="w-5 h-5 text-emerald-600 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-slate-900">
                Asset<span className="text-emerald-500">Chain</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                Digital Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
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
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  account ? (isWrongNetwork ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse') : 'bg-slate-400'
                }`}
              />
              <span className="text-slate-700">{networkName}</span>
            </div>

            {account ? (
              <div className="flex items-center gap-2">
                {/* Account & Balance Badge */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Balance</span>
                    <span className="text-xs font-black text-emerald-600">{balance} ETH</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-800 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formatAddress(account)}</span>
                  </div>
                </div>

                <button
                  onClick={disconnectWallet}
                  title="Disconnect Wallet"
                  className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3 shadow-xl">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    active ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-200">
            {account ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-800">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>{formatAddress(account)}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600">{balance} ETH</span>
                </div>
                <button
                  onClick={() => {
                    disconnectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-rose-200 bg-rose-50 text-rose-600 font-bold text-xs shadow-sm"
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
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
