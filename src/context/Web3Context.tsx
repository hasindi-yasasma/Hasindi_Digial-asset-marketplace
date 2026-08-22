'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, MARKETPLACE_ABI, DIGITAL_ASSET_NFT_ABI } from '../utils/contractsConfig';
import { Asset, DashboardStats, HolderInfo, OwnershipRecord, ToastMessage } from '../types';

interface Web3ContextType {
  account: string | null;
  balance: string;
  chainId: string | null;
  networkName: string;
  isConnecting: boolean;
  isWrongNetwork: boolean;
  toasts: ToastMessage[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Read operations directly from smart contract
  getAllAssets: () => Promise<Asset[]>;
  getAsset: (tokenId: number) => Promise<Asset | null>;
  getOwnershipHistory: (tokenId: number) => Promise<OwnershipRecord[]>;
  getAllTransactions: () => Promise<OwnershipRecord[]>;
  getDashboardStats: () => Promise<DashboardStats | null>;
  getTopHolders: () => Promise<HolderInfo[]>;

  // Write operations via MetaMask Signer
  createAndListAsset: (
    name: string,
    description: string,
    category: string,
    imageUrl: string,
    priceEth: string,
    forSale: boolean
  ) => Promise<boolean>;
  listAsset: (tokenId: number, priceEth: string) => Promise<boolean>;
  buyAsset: (tokenId: number, priceEth: string) => Promise<boolean>;
  updateListingPrice: (tokenId: number, newPriceEth: string) => Promise<boolean>;
  cancelListing: (tokenId: number) => Promise<boolean>;
  transferAsset: (tokenId: number, toAddress: string) => Promise<boolean>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const TARGET_CHAIN_ID_HEX = process.env.NEXT_PUBLIC_CHAIN_ID === '11155111' ? '0xaa36a7' : (process.env.NEXT_PUBLIC_CHAIN_ID ? '0x' + parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10).toString(16) : '0xaa36a7');

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [chainId, setChainId] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string>('Not Connected');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getProvider = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    const rpcUrls = [
      process.env.NEXT_PUBLIC_RPC_URL,
      'https://ethereum-sepolia-rpc.publicnode.com',
      'https://rpc.ankr.com/eth_sepolia',
      'https://1rpc.io/sepolia',
      'https://sepolia.drpc.org',
    ].filter(Boolean) as string[];

    const uniqueUrls = Array.from(new Set(rpcUrls));
    const providers = uniqueUrls.map(
      (url) => new ethers.JsonRpcProvider(url, 11155111, { staticNetwork: true })
    );
    return new ethers.FallbackProvider(providers);
  }, []);

  const updateAccountBalance = useCallback(async (userAccount: string) => {
    try {
      const provider = getProvider();
      const rawBal = await provider.getBalance(userAccount);
      setBalance(parseFloat(ethers.formatEther(rawBal)).toFixed(4));
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, [getProvider]);

  const checkNetwork = useCallback((netChainIdHex: string) => {
    const decChainId = parseInt(netChainIdHex, 16).toString();
    setChainId(decChainId);

    if (decChainId === '11155111') {
      setNetworkName('Ethereum Sepolia');
      setIsWrongNetwork(false);
    } else {
      setNetworkName(`Unsupported Network (${decChainId})`);
      setIsWrongNetwork(true);
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      addToast('error', 'MetaMask Required', 'Please install MetaMask extension to use this application.');
      return;
    }

    try {
      setIsConnecting(true);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isDisconnected');
      }
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const currentChainId = await ethereum.request({ method: 'eth_chainId' });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await updateAccountBalance(accounts[0]);
        checkNetwork(currentChainId);
        addToast('success', 'Wallet Connected', `Connected account: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      addToast('error', 'Connection Failed', error.message || 'User rejected wallet connection.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isDisconnected', 'true');
    }
    setAccount(null);
    setBalance('0.00');

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (err) {
        // Fallback if wallet doesn't support revokePermissions
      }
    }
    addToast('info', 'Wallet Disconnected', 'Disconnected from MetaMask.');
  };

  const switchNetwork = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    const ethereum = (window as any).ethereum;
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Ethereum Sepolia',
                rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'],
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      }
    }
  };

  // Setup Event Listeners for MetaMask
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      const handleAccountsChanged = (accounts: string[]) => {
        const isManuallyDisconnected = localStorage.getItem('isDisconnected') === 'true';
        if (accounts.length > 0 && !isManuallyDisconnected) {
          setAccount(accounts[0]);
          updateAccountBalance(accounts[0]);
          addToast('info', 'Account Changed', `Active account: ${accounts[0].substring(0, 6)}...`);
        } else if (accounts.length === 0) {
          setAccount(null);
          setBalance('0.00');
        }
      };

      const handleChainChanged = (newChainId: string) => {
        checkNetwork(newChainId);
        ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
          if (accounts.length > 0 && localStorage.getItem('isDisconnected') !== 'true') {
            updateAccountBalance(accounts[0]);
          }
        });
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected on load (only if not manually disconnected)
      if (localStorage.getItem('isDisconnected') !== 'true') {
        ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            updateAccountBalance(accounts[0]);
          }
        });
      }

      ethereum.request({ method: 'eth_chainId' }).then((cId: string) => {
        checkNetwork(cId);
      });

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [checkNetwork, updateAccountBalance, addToast]);

  // READ CONTRACT OPERATIONS
  const getMarketplaceContractRead = useCallback(() => {
    const provider = getProvider();
    return new ethers.Contract(
      CONTRACT_ADDRESSES.marketplaceAddress,
      MARKETPLACE_ABI,
      provider
    );
  }, [getProvider]);

  const getAllAssets = async (): Promise<Asset[]> => {
    try {
      const contract = getMarketplaceContractRead();
      const rawList = await contract.getAllAssets();
      return rawList.map((a: any) => ({
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
    } catch (err) {
      console.error('Error fetching assets:', err);
      return [];
    }
  };

  const getAsset = async (tokenId: number): Promise<Asset | null> => {
    try {
      const contract = getMarketplaceContractRead();
      const a = await contract.getAsset(tokenId);
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
    } catch (err) {
      console.error(`Error fetching asset ${tokenId}:`, err);
      return null;
    }
  };

  const getOwnershipHistory = async (tokenId: number): Promise<OwnershipRecord[]> => {
    try {
      const contract = getMarketplaceContractRead();
      const rawHistory = await contract.getOwnershipHistory(tokenId);
      return rawHistory.map((h: any) => ({
        tokenId: Number(h.tokenId),
        from: h.from,
        to: h.to,
        priceWei: h.price.toString(),
        priceEth: ethers.formatEther(h.price),
        timestamp: Number(h.timestamp),
        eventType: h.eventType,
      }));
    } catch (err) {
      console.error(`Error fetching history for token ${tokenId}:`, err);
      return [];
    }
  };

  const getAllTransactions = async (): Promise<OwnershipRecord[]> => {
    try {
      const contract = getMarketplaceContractRead();
      const rawList = await contract.getAllTransactions();
      return rawList.map((tx: any) => ({
        tokenId: Number(tx.tokenId),
        from: tx.from,
        to: tx.to,
        priceWei: tx.price.toString(),
        priceEth: ethers.formatEther(tx.price),
        timestamp: Number(tx.timestamp),
        eventType: tx.eventType,
      }));
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return [];
    }
  };

  const getDashboardStats = async (): Promise<DashboardStats | null> => {
    try {
      const contract = getMarketplaceContractRead();
      const s = await contract.getMarketplaceStats();
      return {
        totalAssets: Number(s.totalAssets),
        assetsForSale: Number(s.assetsForSale),
        assetsSold: Number(s.assetsSold),
        totalTransactions: Number(s.totalTransactions),
        uniqueOwnersCount: Number(s.uniqueOwnersCount),
        totalVolumeWei: s.totalVolumeWei.toString(),
        totalVolumeEth: ethers.formatEther(s.totalVolumeWei),
        highestValueAssetPriceWei: s.highestValueAssetPrice.toString(),
        highestValueAssetPriceEth: ethers.formatEther(s.highestValueAssetPrice),
      };
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  };

  const getTopHolders = async (): Promise<HolderInfo[]> => {
    try {
      const contract = getMarketplaceContractRead();
      const rawHolders = await contract.getTopHolders();
      return rawHolders.map((h: any) => ({
        holder: h.holder,
        assetCount: Number(h.assetCount),
      }));
    } catch (err) {
      console.error('Error fetching top holders:', err);
      return [];
    }
  };

  // WRITE OPERATIONS VIA SIGNER
  const getSignerAndMarketplace = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      throw new Error('MetaMask not detected');
    }
    const ethereum = (window as any).ethereum;

    // Verify network is Sepolia before performing write transaction
    const currentChainIdHex = await ethereum.request({ method: 'eth_chainId' });
    const decChainId = parseInt(currentChainIdHex, 16).toString();
    if (decChainId !== '11155111') {
      addToast('info', 'Switching Network', 'Switching MetaMask to Ethereum Sepolia...');
      await switchNetwork();
    }

    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.marketplaceAddress,
      MARKETPLACE_ABI,
      signer
    );
    const nftContract = new ethers.Contract(
      CONTRACT_ADDRESSES.nftContractAddress,
      DIGITAL_ASSET_NFT_ABI,
      signer
    );
    return { signer, contract, nftContract };
  };

  const createAndListAsset = async (
    name: string,
    description: string,
    category: string,
    imageUrl: string,
    priceEth: string,
    forSale: boolean
  ): Promise<boolean> => {
    try {
      const cleanName = name.trim();
      const cleanDesc = description.trim();
      const cleanCategory = category.trim() || 'Art';
      const cleanImageUrl = imageUrl.trim();
      const cleanPrice = priceEth ? priceEth.trim() : '0';

      if (!cleanName || !cleanCategory || !cleanImageUrl) {
        addToast('error', 'Validation Error', 'Title, category, and image URL are required.');
        return false;
      }

      const priceWei = forSale ? ethers.parseEther(cleanPrice) : 0n;
      if (forSale && priceWei <= 0n) {
        addToast('error', 'Validation Error', 'Listing price must be greater than 0 ETH.');
        return false;
      }

      addToast('info', 'Transaction Pending', 'Please confirm the minting transaction in MetaMask...');
      const { contract } = await getSignerAndMarketplace();

      let gasLimit: bigint;
      try {
        const estimated = await contract.createAndListAsset.estimateGas(
          cleanName,
          cleanDesc,
          cleanCategory,
          cleanImageUrl,
          priceWei,
          forSale
        );
        gasLimit = (estimated * 135n) / 100n;
      } catch (estErr) {
        console.warn('Gas estimation fallback used (2M gas):', estErr);
        gasLimit = 2000000n;
      }

      const tx = await contract.createAndListAsset(
        cleanName,
        cleanDesc,
        cleanCategory,
        cleanImageUrl,
        priceWei,
        forSale,
        { gasLimit }
      );

      addToast('info', 'Mining Block', `Transaction submitted: ${tx.hash.substring(0, 10)}... Waiting for confirmation.`);
      await tx.wait();
      addToast('success', 'Asset Created!', 'Digital Asset token successfully minted and listed on-chain!');
      if (account) updateAccountBalance(account);
      return true;
    } catch (err: any) {
      console.error('Create asset error:', err);
      const msg = err.reason || err.shortMessage || err.message || 'Transaction reverted.';
      addToast('error', 'Minting Failed', msg);
      return false;
    }
  };

  const listAsset = async (tokenId: number, priceEth: string): Promise<boolean> => {
    try {
      addToast('info', 'Transaction Pending', 'Confirm price listing in MetaMask...');
      const { contract } = await getSignerAndMarketplace();
      const priceWei = ethers.parseEther(priceEth);

      let gasLimit: bigint;
      try {
        const estimated = await contract.listAsset.estimateGas(tokenId, priceWei);
        gasLimit = (estimated * 130n) / 100n;
      } catch (estErr) {
        console.warn('Gas estimation failed, using fallback gas limit:', estErr);
        gasLimit = 400000n;
      }

      const tx = await contract.listAsset(tokenId, priceWei, { gasLimit });
      addToast('info', 'Mining Block', 'Listing transaction submitted. Awaiting block confirmation...');
      await tx.wait();
      addToast('success', 'Asset Listed!', `Token #${tokenId} is now listed for ${priceEth} ETH.`);
      return true;
    } catch (err: any) {
      console.error('List asset error:', err);
      addToast('error', 'Listing Failed', err.reason || err.shortMessage || err.message || 'Transaction failed.');
      return false;
    }
  };

  const buyAsset = async (tokenId: number, priceEth: string): Promise<boolean> => {
    try {
      addToast('info', 'Purchase Pending', 'Confirm ETH transfer and purchase in MetaMask...');
      const { contract } = await getSignerAndMarketplace();
      const priceWei = ethers.parseEther(priceEth);

      let gasLimit: bigint;
      try {
        const estimated = await contract.buyAsset.estimateGas(tokenId, { value: priceWei });
        gasLimit = (estimated * 130n) / 100n;
      } catch (estErr) {
        console.warn('Gas estimation failed, using fallback gas limit:', estErr);
        gasLimit = 600000n;
      }

      const tx = await contract.buyAsset(tokenId, { value: priceWei, gasLimit });
      addToast('info', 'Processing Purchase', `Buying Token #${tokenId}. Waiting for block confirmation...`);
      await tx.wait();
      addToast('success', 'Purchase Complete!', `Congratulations! Token #${tokenId} ownership transferred to your wallet.`);
      if (account) updateAccountBalance(account);
      return true;
    } catch (err: any) {
      console.error('Buy asset error:', err);
      addToast('error', 'Purchase Failed', err.reason || err.shortMessage || err.message || 'Transaction failed.');
      return false;
    }
  };

  const updateListingPrice = async (tokenId: number, newPriceEth: string): Promise<boolean> => {
    try {
      addToast('info', 'Transaction Pending', 'Confirm price update in MetaMask...');
      const { contract } = await getSignerAndMarketplace();
      const newPriceWei = ethers.parseEther(newPriceEth);

      let gasLimit: bigint;
      try {
        const estimated = await contract.updateListingPrice.estimateGas(tokenId, newPriceWei);
        gasLimit = (estimated * 130n) / 100n;
      } catch (estErr) {
        console.warn('Gas estimation failed, using fallback gas limit:', estErr);
        gasLimit = 300000n;
      }

      const tx = await contract.updateListingPrice(tokenId, newPriceWei, { gasLimit });
      await tx.wait();
      addToast('success', 'Price Updated!', `Listing price updated to ${newPriceEth} ETH.`);
      return true;
    } catch (err: any) {
      console.error('Update price error:', err);
      addToast('error', 'Update Failed', err.reason || err.shortMessage || err.message || 'Transaction failed.');
      return false;
    }
  };

  const cancelListing = async (tokenId: number): Promise<boolean> => {
    try {
      addToast('info', 'Transaction Pending', 'Confirm listing cancellation in MetaMask...');
      const { contract } = await getSignerAndMarketplace();

      let gasLimit: bigint;
      try {
        const estimated = await contract.cancelListing.estimateGas(tokenId);
        gasLimit = (estimated * 130n) / 100n;
      } catch (estErr) {
        console.warn('Gas estimation failed, using fallback gas limit:', estErr);
        gasLimit = 300000n;
      }

      const tx = await contract.cancelListing(tokenId, { gasLimit });
      await tx.wait();
      addToast('success', 'Listing Cancelled', `Token #${tokenId} is no longer for sale.`);
      return true;
    } catch (err: any) {
      console.error('Cancel listing error:', err);
      addToast('error', 'Cancel Failed', err.reason || err.shortMessage || err.message || 'Transaction failed.');
      return false;
    }
  };

  const transferAsset = async (tokenId: number, toAddress: string): Promise<boolean> => {
    try {
      addToast('info', 'Transfer Pending', `Confirm transfer of Token #${tokenId} to ${toAddress.substring(0, 6)}...`);
      const { contract, nftContract } = await getSignerAndMarketplace();

      const isApproved = await nftContract.isApprovedForAll(account, CONTRACT_ADDRESSES.marketplaceAddress);
      if (!isApproved) {
        addToast('info', 'Approve Operator', 'Approving Marketplace contract to manage transfer...');
        let appGasLimit: bigint;
        try {
          const estimated = await nftContract.setApprovalForAll.estimateGas(CONTRACT_ADDRESSES.marketplaceAddress, true);
          appGasLimit = (estimated * 130n) / 100n;
        } catch (estErr) {
          console.warn('Approval gas estimation failed, using fallback limit:', estErr);
          appGasLimit = 300000n;
        }
        const appTx = await nftContract.setApprovalForAll(CONTRACT_ADDRESSES.marketplaceAddress, true, { gasLimit: appGasLimit });
        await appTx.wait();
      }

      let gasLimit: bigint;
      try {
        const estimated = await contract.transferAsset.estimateGas(tokenId, toAddress);
        gasLimit = (estimated * 130n) / 100n;
      } catch (estErr) {
        console.warn('Transfer gas estimation failed, using fallback limit:', estErr);
        gasLimit = 400000n;
      }

      const tx = await contract.transferAsset(tokenId, toAddress, { gasLimit });
      await tx.wait();
      addToast('success', 'Asset Transferred!', `Token #${tokenId} transferred to ${toAddress}.`);
      if (account) updateAccountBalance(account);
      return true;
    } catch (err: any) {
      console.error('Transfer asset error:', err);
      addToast('error', 'Transfer Failed', err.reason || err.shortMessage || err.message || 'Transaction failed.');
      return false;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        balance,
        chainId,
        networkName,
        isConnecting,
        isWrongNetwork,
        toasts,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        addToast,
        removeToast,
        getAllAssets,
        getAsset,
        getOwnershipHistory,
        getAllTransactions,
        getDashboardStats,
        getTopHolders,
        createAndListAsset,
        listAsset,
        buyAsset,
        updateListingPrice,
        cancelListing,
        transferAsset,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
