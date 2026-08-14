export function formatAddress(address: string | undefined | null): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatEth(valEth: string | number): string {
  const num = typeof valEth === 'string' ? parseFloat(valEth) : valEth;
  if (isNaN(num)) return '0.00 ETH';
  return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ETH`;
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getCategoryBadgeColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'art':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'collectibles':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'gaming':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'virtual real estate':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    case 'music':
      return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
    case 'photography':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}
