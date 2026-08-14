// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DigitalAssetNFT.sol";

/**
 * @title Marketplace
 * @notice Decentralized Digital Asset Marketplace for minting, listing, buying, selling, and transferring digital assets.
 */
contract Marketplace is ReentrancyGuard, Ownable {
    DigitalAssetNFT public immutable nftContract;

    struct Asset {
        uint256 tokenId;
        string name;
        string description;
        string category;
        string imageUrl;
        address creator;
        address currentOwner;
        uint256 price;
        bool forSale;
        uint256 createdAt;
    }

    struct OwnershipRecord {
        uint256 tokenId;
        address from;
        address to;
        uint256 price;
        uint256 timestamp;
        string eventType; // "Mint", "List", "Sale", "Transfer", "Cancel", "PriceUpdate"
    }

    struct MarketplaceStats {
        uint256 totalAssets;
        uint256 assetsForSale;
        uint256 assetsSold;
        uint256 totalTransactions;
        uint256 uniqueOwnersCount;
        uint256 totalVolumeWei;
        uint256 highestValueAssetPrice;
    }

    struct HolderInfo {
        address holder;
        uint256 assetCount;
    }

    // Mapping from tokenId to Asset
    mapping(uint256 => Asset) private _assets;
    // Mapping from tokenId to ownership history
    mapping(uint256 => OwnershipRecord[]) private _ownershipHistory;
    
    // Global tracking
    uint256[] private _allTokenIds;
    OwnershipRecord[] private _allTransactions;
    uint256 public totalVolumeWei;
    uint256 public assetsSold;

    // Custom errors
    error NotOwner();
    error PriceMustBeGreaterThanZero();
    error AssetNotForSale();
    error InsufficientPayment(uint256 price, uint256 value);
    error AlreadyListed();
    error CannotBuyOwnAsset();
    error InvalidAddress();
    error AssetDoesNotExist();
    error TransferFailed();
    error EmptyString();

    // Events
    event AssetCreated(
        uint256 indexed tokenId,
        string name,
        string category,
        string imageUrl,
        address indexed creator,
        address indexed owner,
        uint256 price,
        bool forSale,
        uint256 timestamp
    );

    event AssetListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event AssetPurchased(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event AssetTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event PriceUpdated(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );

    event ListingCancelled(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 timestamp
    );

    constructor(address nftContractAddress, address initialOwner) Ownable(initialOwner) {
        if (nftContractAddress == address(0)) revert InvalidAddress();
        nftContract = DigitalAssetNFT(nftContractAddress);
    }

    /**
     * @notice Register a digital asset, mint its NFT token, and optionally list it for sale.
     */
    function createAndListAsset(
        string memory name,
        string memory description,
        string memory category,
        string memory imageUrl,
        uint256 price,
        bool forSale
    ) external nonReentrant returns (uint256) {
        if (bytes(name).length == 0 || bytes(category).length == 0 || bytes(imageUrl).length == 0) {
            revert EmptyString();
        }
        if (forSale && price == 0) {
            revert PriceMustBeGreaterThanZero();
        }

        // Mint token via DigitalAssetNFT to msg.sender
        uint256 tokenId = nftContract.mintToken(msg.sender, imageUrl);

        Asset memory newAsset = Asset({
            tokenId: tokenId,
            name: name,
            description: description,
            category: category,
            imageUrl: imageUrl,
            creator: msg.sender,
            currentOwner: msg.sender,
            price: price,
            forSale: forSale,
            createdAt: block.timestamp
        });

        _assets[tokenId] = newAsset;
        _allTokenIds.push(tokenId);

        // Record "Mint" history
        OwnershipRecord memory mintRecord = OwnershipRecord({
            tokenId: tokenId,
            from: address(0),
            to: msg.sender,
            price: 0,
            timestamp: block.timestamp,
            eventType: "Mint"
        });
        _ownershipHistory[tokenId].push(mintRecord);
        _allTransactions.push(mintRecord);

        emit AssetCreated(
            tokenId,
            name,
            category,
            imageUrl,
            msg.sender,
            msg.sender,
            price,
            forSale,
            block.timestamp
        );

        if (forSale) {
            OwnershipRecord memory listRecord = OwnershipRecord({
                tokenId: tokenId,
                from: msg.sender,
                to: msg.sender,
                price: price,
                timestamp: block.timestamp,
                eventType: "List"
            });
            _ownershipHistory[tokenId].push(listRecord);
            _allTransactions.push(listRecord);

            emit AssetListed(tokenId, msg.sender, price, block.timestamp);
        }

        return tokenId;
    }

    /**
     * @notice List an unlisted asset for sale or relist it.
     */
    function listAsset(uint256 tokenId, uint256 price) external nonReentrant {
        Asset storage asset = _assets[tokenId];
        if (asset.tokenId == 0) revert AssetDoesNotExist();
        if (asset.currentOwner != msg.sender) revert NotOwner();
        if (price == 0) revert PriceMustBeGreaterThanZero();
        if (asset.forSale) revert AlreadyListed();

        asset.price = price;
        asset.forSale = true;

        OwnershipRecord memory listRecord = OwnershipRecord({
            tokenId: tokenId,
            from: msg.sender,
            to: msg.sender,
            price: price,
            timestamp: block.timestamp,
            eventType: "List"
        });
        _ownershipHistory[tokenId].push(listRecord);
        _allTransactions.push(listRecord);

        emit AssetListed(tokenId, msg.sender, price, block.timestamp);
    }

    /**
     * @notice Purchase a listed digital asset.
     */
    function buyAsset(uint256 tokenId) external payable nonReentrant {
        Asset storage asset = _assets[tokenId];
        if (asset.tokenId == 0) revert AssetDoesNotExist();
        if (!asset.forSale) revert AssetNotForSale();
        if (msg.sender == asset.currentOwner) revert CannotBuyOwnAsset();
        if (msg.value < asset.price) revert InsufficientPayment(asset.price, msg.value);

        address seller = asset.currentOwner;
        uint256 price = asset.price;

        // Checks-Effects-Interactions Pattern
        // State updates BEFORE external calls
        asset.currentOwner = msg.sender;
        asset.forSale = false;
        totalVolumeWei += price;
        assetsSold++;

        OwnershipRecord memory saleRecord = OwnershipRecord({
            tokenId: tokenId,
            from: seller,
            to: msg.sender,
            price: price,
            timestamp: block.timestamp,
            eventType: "Sale"
        });
        _ownershipHistory[tokenId].push(saleRecord);
        _allTransactions.push(saleRecord);

        // External Transfer 1: Transfer NFT from seller to buyer
        nftContract.safeTransferFrom(seller, msg.sender, tokenId);

        // External Transfer 2: Send payment to seller
        (bool success, ) = payable(seller).call{value: price}("");
        if (!success) revert TransferFailed();

        // Refund excess payment if any
        if (msg.value > price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - price}("");
            if (!refundSuccess) revert TransferFailed();
        }

        emit AssetPurchased(tokenId, msg.sender, seller, price, block.timestamp);
    }

    /**
     * @notice Update price of a listed asset.
     */
    function updateListingPrice(uint256 tokenId, uint256 newPrice) external nonReentrant {
        Asset storage asset = _assets[tokenId];
        if (asset.tokenId == 0) revert AssetDoesNotExist();
        if (asset.currentOwner != msg.sender) revert NotOwner();
        if (!asset.forSale) revert AssetNotForSale();
        if (newPrice == 0) revert PriceMustBeGreaterThanZero();

        uint256 oldPrice = asset.price;
        asset.price = newPrice;

        OwnershipRecord memory updateRecord = OwnershipRecord({
            tokenId: tokenId,
            from: msg.sender,
            to: msg.sender,
            price: newPrice,
            timestamp: block.timestamp,
            eventType: "PriceUpdate"
        });
        _ownershipHistory[tokenId].push(updateRecord);
        _allTransactions.push(updateRecord);

        emit PriceUpdated(tokenId, msg.sender, oldPrice, newPrice, block.timestamp);
    }

    /**
     * @notice Cancel an active listing.
     */
    function cancelListing(uint256 tokenId) external nonReentrant {
        Asset storage asset = _assets[tokenId];
        if (asset.tokenId == 0) revert AssetDoesNotExist();
        if (asset.currentOwner != msg.sender) revert NotOwner();
        if (!asset.forSale) revert AssetNotForSale();

        asset.forSale = false;

        OwnershipRecord memory cancelRecord = OwnershipRecord({
            tokenId: tokenId,
            from: msg.sender,
            to: msg.sender,
            price: asset.price,
            timestamp: block.timestamp,
            eventType: "Cancel"
        });
        _ownershipHistory[tokenId].push(cancelRecord);
        _allTransactions.push(cancelRecord);

        emit ListingCancelled(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @notice Direct P2P transfer of an asset to another wallet.
     */
    function transferAsset(uint256 tokenId, address to) external nonReentrant {
        if (to == address(0) || to == msg.sender) revert InvalidAddress();
        Asset storage asset = _assets[tokenId];
        if (asset.tokenId == 0) revert AssetDoesNotExist();
        if (asset.currentOwner != msg.sender) revert NotOwner();

        address from = msg.sender;
        asset.currentOwner = to;
        asset.forSale = false;

        OwnershipRecord memory transferRecord = OwnershipRecord({
            tokenId: tokenId,
            from: from,
            to: to,
            price: 0,
            timestamp: block.timestamp,
            eventType: "Transfer"
        });
        _ownershipHistory[tokenId].push(transferRecord);
        _allTransactions.push(transferRecord);

        nftContract.safeTransferFrom(from, to, tokenId);

        emit AssetTransferred(tokenId, from, to, block.timestamp);
    }

    // ================= GETTER / VIEW FUNCTIONS =================

    /**
     * @notice Fetch a single asset by token ID.
     */
    function getAsset(uint256 tokenId) external view returns (Asset memory) {
        if (_assets[tokenId].tokenId == 0) revert AssetDoesNotExist();
        return _assets[tokenId];
    }

    /**
     * @notice Fetch all assets registered in the marketplace.
     */
    function getAllAssets() external view returns (Asset[] memory) {
        uint256 total = _allTokenIds.length;
        Asset[] memory items = new Asset[](total);
        for (uint256 i = 0; i < total; i++) {
            items[i] = _assets[_allTokenIds[i]];
        }
        return items;
    }

    /**
     * @notice Fetch ownership history for a specific token ID.
     */
    function getOwnershipHistory(uint256 tokenId) external view returns (OwnershipRecord[] memory) {
        if (_assets[tokenId].tokenId == 0) revert AssetDoesNotExist();
        return _ownershipHistory[tokenId];
    }

    /**
     * @notice Fetch all transaction events across the marketplace.
     */
    function getAllTransactions() external view returns (OwnershipRecord[] memory) {
        return _allTransactions;
    }

    /**
     * @notice Get aggregated marketplace statistics.
     */
    function getMarketplaceStats() external view returns (MarketplaceStats memory) {
        uint256 total = _allTokenIds.length;
        uint256 forSaleCount = 0;
        uint256 highestPrice = 0;

        address[] memory ownersTemp = new address[](total);
        uint256 uniqueCount = 0;

        for (uint256 i = 0; i < total; i++) {
            Asset memory a = _assets[_allTokenIds[i]];
            if (a.forSale) {
                forSaleCount++;
            }
            if (a.price > highestPrice) {
                highestPrice = a.price;
            }

            // Check unique owners
            bool exists = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (ownersTemp[j] == a.currentOwner) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                ownersTemp[uniqueCount] = a.currentOwner;
                uniqueCount++;
            }
        }

        return MarketplaceStats({
            totalAssets: total,
            assetsForSale: forSaleCount,
            assetsSold: assetsSold,
            totalTransactions: _allTransactions.length,
            uniqueOwnersCount: uniqueCount,
            totalVolumeWei: totalVolumeWei,
            highestValueAssetPrice: highestPrice
        });
    }

    /**
     * @notice Fetch top 10 asset holders.
     */
    function getTopHolders() external view returns (HolderInfo[] memory) {
        uint256 total = _allTokenIds.length;
        if (total == 0) {
            return new HolderInfo[](0);
        }

        address[] memory addresses = new address[](total);
        uint256[] memory counts = new uint256[](total);
        uint256 uniqueCount = 0;

        for (uint256 i = 0; i < total; i++) {
            address ownerAddr = _assets[_allTokenIds[i]].currentOwner;
            bool found = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (addresses[j] == ownerAddr) {
                    counts[j]++;
                    found = true;
                    break;
                }
            }
            if (!found) {
                addresses[uniqueCount] = ownerAddr;
                counts[uniqueCount] = 1;
                uniqueCount++;
            }
        }

        // Sort top holders (simple insertion sort)
        for (uint256 i = 0; i < uniqueCount; i++) {
            for (uint256 j = i + 1; j < uniqueCount; j++) {
                if (counts[j] > counts[i]) {
                    uint256 tempC = counts[i];
                    counts[i] = counts[j];
                    counts[j] = tempC;

                    address tempA = addresses[i];
                    addresses[i] = addresses[j];
                    addresses[j] = tempA;
                }
            }
        }

        uint256 limit = uniqueCount < 10 ? uniqueCount : 10;
        HolderInfo[] memory topHolders = new HolderInfo[](limit);
        for (uint256 i = 0; i < limit; i++) {
            topHolders[i] = HolderInfo({
                holder: addresses[i],
                assetCount: counts[i]
            });
        }

        return topHolders;
    }
}
