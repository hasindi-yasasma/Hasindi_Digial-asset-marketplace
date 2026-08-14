import { expect } from "chai";
import { ethers } from "hardhat";
import { DigitalAssetNFT, Marketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Decentralized Digital Asset Marketplace", function () {
  let nftContract: DigitalAssetNFT;
  let marketplace: Marketplace;
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  let user3: SignerWithAddress;

  const sampleName = "Cyberpunk Digital Avatar";
  const sampleDesc = "A rare 3D collectible digital asset stored on Ethereum.";
  const sampleCategory = "Art";
  const sampleImg = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe";
  const samplePrice = ethers.parseEther("1.0"); // 1 ETH

  beforeEach(async function () {
    [owner, seller, buyer, user3] = await ethers.getSigners();

    const NFTFactory = await ethers.getContractFactory("DigitalAssetNFT");
    nftContract = (await NFTFactory.deploy(owner.address)) as DigitalAssetNFT;
    await nftContract.waitForDeployment();

    const MarketplaceFactory = await ethers.getContractFactory("Marketplace");
    marketplace = (await MarketplaceFactory.deploy(
      await nftContract.getAddress(),
      owner.address
    )) as Marketplace;
    await marketplace.waitForDeployment();

    await nftContract.setMarketplaceAddress(await marketplace.getAddress());
  });

  describe("Asset Creation and Minting", function () {
    it("Should allow a user to create and list a new asset", async function () {
      const tx = await marketplace
        .connect(seller)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, samplePrice, true);

      await expect(tx)
        .to.emit(marketplace, "AssetCreated");

      const asset = await marketplace.getAsset(1);
      expect(asset.tokenId).to.equal(1);
      expect(asset.name).to.equal(sampleName);
      expect(asset.creator).to.equal(seller.address);
      expect(asset.currentOwner).to.equal(seller.address);
      expect(asset.price).to.equal(samplePrice);
      expect(asset.forSale).to.be.true;
    });

    it("Should revert if required fields are empty", async function () {
      await expect(
        marketplace
          .connect(seller)
          .createAndListAsset("", sampleDesc, sampleCategory, sampleImg, samplePrice, true)
      ).to.be.revertedWithCustomError(marketplace, "EmptyString");
    });

    it("Should revert if listed for sale with 0 price", async function () {
      await expect(
        marketplace
          .connect(seller)
          .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, 0, true)
      ).to.be.revertedWithCustomError(marketplace, "PriceMustBeGreaterThanZero");
    });
  });

  describe("Buying Assets", function () {
    beforeEach(async function () {
      await marketplace
        .connect(seller)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, samplePrice, true);
    });

    it("Should allow a buyer to purchase an asset for sale", async function () {
      const sellerInitialBal = await ethers.provider.getBalance(seller.address);

      const buyTx = await marketplace
        .connect(buyer)
        .buyAsset(1, { value: samplePrice });

      await expect(buyTx)
        .to.emit(marketplace, "AssetPurchased");

      const updatedAsset = await marketplace.getAsset(1);
      expect(updatedAsset.currentOwner).to.equal(buyer.address);
      expect(updatedAsset.forSale).to.be.false;

      const sellerFinalBal = await ethers.provider.getBalance(seller.address);
      expect(sellerFinalBal - sellerInitialBal).to.equal(samplePrice);
    });

    it("Should revert if buyer attempts to purchase their own asset", async function () {
      await expect(
        marketplace.connect(seller).buyAsset(1, { value: samplePrice })
      ).to.be.revertedWithCustomError(marketplace, "CannotBuyOwnAsset");
    });

    it("Should revert if payment is insufficient", async function () {
      const lowPrice = ethers.parseEther("0.5");
      await expect(
        marketplace.connect(buyer).buyAsset(1, { value: lowPrice })
      ).to.be.revertedWithCustomError(marketplace, "InsufficientPayment");
    });
  });

  describe("Listing Management (Relist, Price Update, Cancel)", function () {
    beforeEach(async function () {
      await marketplace
        .connect(seller)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, samplePrice, false);
    });

    it("Should allow owner to list an unlisted asset", async function () {
      await expect(marketplace.connect(seller).listAsset(1, samplePrice))
        .to.emit(marketplace, "AssetListed");

      const asset = await marketplace.getAsset(1);
      expect(asset.forSale).to.be.true;
    });

    it("Should allow owner to update price", async function () {
      await marketplace.connect(seller).listAsset(1, samplePrice);
      const newPrice = ethers.parseEther("2.5");

      await expect(marketplace.connect(seller).updateListingPrice(1, newPrice))
        .to.emit(marketplace, "PriceUpdated");

      const asset = await marketplace.getAsset(1);
      expect(asset.price).to.equal(newPrice);
    });

    it("Should allow owner to cancel listing", async function () {
      await marketplace.connect(seller).listAsset(1, samplePrice);

      await expect(marketplace.connect(seller).cancelListing(1))
        .to.emit(marketplace, "ListingCancelled");

      const asset = await marketplace.getAsset(1);
      expect(asset.forSale).to.be.false;
    });
  });

  describe("Direct Transfer", function () {
    it("Should transfer asset directly to another wallet address", async function () {
      await marketplace
        .connect(seller)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, samplePrice, true);

      await expect(marketplace.connect(seller).transferAsset(1, user3.address))
        .to.emit(marketplace, "AssetTransferred");

      const asset = await marketplace.getAsset(1);
      expect(asset.currentOwner).to.equal(user3.address);
      expect(asset.forSale).to.be.false;
    });
  });

  describe("Ownership History and Marketplace Statistics", function () {
    it("Should record full ownership history immutably", async function () {
      await marketplace
        .connect(seller)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, samplePrice, true);

      await marketplace.connect(buyer).buyAsset(1, { value: samplePrice });

      await marketplace.connect(buyer).transferAsset(1, user3.address);

      const history = await marketplace.getOwnershipHistory(1);
      expect(history.length).to.equal(4); // Mint, List, Sale, Transfer
      expect(history[0].eventType).to.equal("Mint");
      expect(history[1].eventType).to.equal("List");
      expect(history[2].eventType).to.equal("Sale");
      expect(history[3].eventType).to.equal("Transfer");
    });

    it("Should return correct marketplace statistics and top holders", async function () {
      await marketplace
        .connect(seller)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, samplePrice, true);

      await marketplace
        .connect(seller)
        .createAndListAsset("Asset 2", sampleDesc, sampleCategory, sampleImg, samplePrice, false);

      const stats = await marketplace.getMarketplaceStats();
      expect(stats.totalAssets).to.equal(2);
      expect(stats.assetsForSale).to.equal(1);

      const topHolders = await marketplace.getTopHolders();
      expect(topHolders.length).to.equal(1);
      expect(topHolders[0].holder).to.equal(seller.address);
      expect(topHolders[0].assetCount).to.equal(2);
    });
  });
});
