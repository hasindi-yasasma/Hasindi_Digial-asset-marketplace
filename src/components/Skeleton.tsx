'use client';

import React from 'react';

export const AssetCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 space-y-4 animate-pulse">
      <div className="w-full h-56 bg-slate-800 rounded-xl" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="h-6 bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-800 rounded w-full" />
      </div>
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <div className="h-5 bg-slate-800 rounded w-1/4" />
        <div className="h-8 bg-slate-800 rounded-xl w-24" />
      </div>
    </div>
  );
};

export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="w-10 h-10 bg-slate-800 rounded-xl" />
      </div>
      <div className="h-8 bg-slate-800 rounded w-1/2" />
      <div className="h-3 bg-slate-800 rounded w-2/3" />
    </div>
  );
};
