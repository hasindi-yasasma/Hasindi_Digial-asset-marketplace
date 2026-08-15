'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'purple' | 'rose';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon: Icon, color }) => {
  const colorStyles = {
    indigo: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    emerald: 'bg-emerald-100/80 text-emerald-700 border-emerald-300',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    cyan: 'bg-teal-50 text-teal-600 border-teal-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  return (
    <div className="rounded-3xl bg-white/90 border border-slate-200/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-md hover:shadow-xl hover:border-emerald-300 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</span>
        <div className={`p-3 rounded-2xl border shadow-sm ${colorStyles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
};
