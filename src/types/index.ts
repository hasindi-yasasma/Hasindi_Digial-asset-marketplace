export interface Asset {
  tokenId: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  creator: string;
  currentOwner: string;
  priceWei: string;
  priceEth: string;
  forSale: boolean;
  createdAt: number;
}

export interface OwnershipRecord {
  tokenId: number;
  from: string;
  to: string;
  priceWei: string;
  priceEth: string;
  timestamp: number;
  eventType: 'Mint' | 'List' | 'Sale' | 'Transfer' | 'Cancel' | 'PriceUpdate';
}

export interface DashboardStats {
  totalAssets: number;
  assetsForSale: number;
  assetsSold: number;
  totalTransactions: number;
  uniqueOwnersCount: number;
  totalVolumeWei: string;
  totalVolumeEth: string;
  highestValueAssetPriceWei: string;
  highestValueAssetPriceEth: string;
}

export interface HolderInfo {
  holder: string;
  assetCount: number;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}
