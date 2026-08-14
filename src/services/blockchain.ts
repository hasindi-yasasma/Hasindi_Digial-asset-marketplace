import { ethers } from "ethers";
import path from "path";
import fs from "fs";

let provider: ethers.ContractRunner | null = null;
let marketplaceContract: ethers.Contract | null = null;

const FALLBACK_RPC_URLS = [
  process.env.RPC_URL,
  process.env.NEXT_PUBLIC_RPC_URL,
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.ankr.com/eth_sepolia",
  "https://1rpc.io/sepolia",
  "https://sepolia.drpc.org",
].filter(Boolean) as string[];

export function getResilientProvider() {
  const uniqueUrls = Array.from(new Set(FALLBACK_RPC_URLS));
  const providers = uniqueUrls.map(
    (url) => new ethers.JsonRpcProvider(url, 11155111, { staticNetwork: true })
  );
  return new ethers.FallbackProvider(providers);
}

export function initBlockchain() {
  try {
    if (!provider) {
      provider = getResilientProvider();
    }
    const contractsDir = path.join(process.cwd(), "src", "contracts");
    const addressPath = path.join(contractsDir, "contract-address.json");
    const marketplaceAbiPath = path.join(contractsDir, "Marketplace.json");

    if (fs.existsSync(addressPath) && fs.existsSync(marketplaceAbiPath)) {
      const addressData = JSON.parse(fs.readFileSync(addressPath, "utf8"));
      const marketplaceAbiData = JSON.parse(fs.readFileSync(marketplaceAbiPath, "utf8"));

      marketplaceContract = new ethers.Contract(
        addressData.marketplaceAddress,
        marketplaceAbiData.abi,
        provider
      );
    } else {
      console.warn("Contract artifacts not found in src/contracts.");
    }
  } catch (error) {
    console.error("Failed to initialize blockchain provider:", error);
  }
}

export async function checkBlockchainHealth() {
  try {
    if (!provider) {
      provider = getResilientProvider();
    }
    const p = provider as ethers.AbstractProvider;
    const blockNumber = await p.getBlockNumber();
    const network = await p.getNetwork();
    return {
      status: "healthy",
      networkName: network.name,
      chainId: network.chainId.toString(),
      latestBlock: blockNumber,
      rpcUrl: FALLBACK_RPC_URLS[0],
      contractConnected: marketplaceContract !== null,
    };
  } catch (error: any) {
    return {
      status: "unhealthy",
      error: error.message || "Failed to reach RPC node",
    };
  }
}

export async function fetchAllAssets() {
  if (!marketplaceContract) initBlockchain();
  if (!marketplaceContract) throw new Error("Contract not deployed or connected");

  const rawAssets = await marketplaceContract.getAllAssets();
  return rawAssets.map((a: any) => ({
    tokenId: Number(a.tokenId),
    name: a.name,
    description: a.description,
    category: a.category,
    imageUrl: a.imageUrl,
    creator: a.creator,
    currentOwner: a.currentOwner,
    priceWei: a.price.toString(),
    priceEth: ethers.formatEther(a.price),
    forSale: a.forSale,
    createdAt: Number(a.createdAt),
  }));
}

export async function fetchAssetById(tokenId: number) {
  if (!marketplaceContract) initBlockchain();
  if (!marketplaceContract) throw new Error("Contract not deployed or connected");

  const a = await marketplaceContract.getAsset(tokenId);
  return {
    tokenId: Number(a.tokenId),
    name: a.name,
    description: a.description,
    category: a.category,
    imageUrl: a.imageUrl,
    creator: a.creator,
    currentOwner: a.currentOwner,
    priceWei: a.price.toString(),
    priceEth: ethers.formatEther(a.price),
    forSale: a.forSale,
    createdAt: Number(a.createdAt),
  };
}

export async function fetchDashboardStats() {
  if (!marketplaceContract) initBlockchain();
  if (!marketplaceContract) throw new Error("Contract not deployed or connected");

  const stats = await marketplaceContract.getMarketplaceStats();
  return {
    totalAssets: Number(stats.totalAssets),
    assetsForSale: Number(stats.assetsForSale),
    assetsSold: Number(stats.assetsSold),
    totalTransactions: Number(stats.totalTransactions),
    uniqueOwnersCount: Number(stats.uniqueOwnersCount),
    totalVolumeWei: stats.totalVolumeWei.toString(),
    totalVolumeEth: ethers.formatEther(stats.totalVolumeWei),
    highestValueAssetPriceWei: stats.highestValueAssetPrice.toString(),
    highestValueAssetPriceEth: ethers.formatEther(stats.highestValueAssetPrice),
  };
}

export async function fetchOwnershipHistory(tokenId: number) {
  if (!marketplaceContract) initBlockchain();
  if (!marketplaceContract) throw new Error("Contract not deployed or connected");

  const rawHistory = await marketplaceContract.getOwnershipHistory(tokenId);
  return rawHistory.map((h: any) => ({
    tokenId: Number(h.tokenId),
    from: h.from,
    to: h.to,
    priceWei: h.price.toString(),
    priceEth: ethers.formatEther(h.price),
    timestamp: Number(h.timestamp),
    eventType: h.eventType,
  }));
}

export async function fetchAllTransactions() {
  if (!marketplaceContract) initBlockchain();
  if (!marketplaceContract) throw new Error("Contract not deployed or connected");

  const rawTxList = await marketplaceContract.getAllTransactions();
  return rawTxList.map((tx: any) => ({
    tokenId: Number(tx.tokenId),
    from: tx.from,
    to: tx.to,
    priceWei: tx.price.toString(),
    priceEth: ethers.formatEther(tx.price),
    timestamp: Number(tx.timestamp),
    eventType: tx.eventType,
  }));
}

export async function fetchTopHolders() {
  if (!marketplaceContract) initBlockchain();
  if (!marketplaceContract) throw new Error("Contract not deployed or connected");

  const rawHolders = await marketplaceContract.getTopHolders();
  return rawHolders.map((h: any) => ({
    holder: h.holder,
    assetCount: Number(h.assetCount),
  }));
}
