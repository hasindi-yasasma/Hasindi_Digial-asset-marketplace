import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-toolbox";
const { ethers } = hre;
import { DigitalAssetNFT, Marketplace } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("LumenMarketplace Smart Contract", function () {
  let nftContract: DigitalAssetNFT;
  let marketplace: Marketplace;
  let owner: SignerWithAddress;
  let creator: SignerWithAddress;
  let buyer: SignerWithAddress;
  let user3: SignerWithAddress;

  const sampleName = "Cyberpunk Hologram Avatar";
  const sampleDesc = "A rare 3D collectible digital asset stored on Ethereum.";
  const sampleCategory = "Art";
  const sampleImg = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe";
  const samplePrice = ethers.parseEther("1.0"); // 1 ETH

  beforeEach(async function () {
    [owner, creator, buyer, user3] = await ethers.getSigners();

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

  describe("Asset Registration & Minting", function () {
    it("Should register an asset and mint an ERC-721 token to the creator", async function () {
      const tx = await marketplace
        .connect(creator)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, samplePrice, true);

      await expect(tx)
        .to.emit(marketplace, "AssetCreated")
        .withArgs(1, sampleName, sampleCategory, sampleImg, creator.address, creator.address, samplePrice, true, (await ethers.provider.getBlock("latest"))!.timestamp);

      const asset = await marketplace.getAsset(1);
      expect(asset.tokenId).to.equal(1);
      expect(asset.name).to.equal(sampleName);
      expect(asset.creator).to.equal(creator.address);
      expect(asset.currentOwner).to.equal(creator.address);
      expect(asset.price).to.equal(samplePrice);
      expect(asset.forSale).to.be.true;
      expect(await nftContract.ownerOf(1)).to.equal(creator.address);
    });

    it("Should register an unlisted asset when price is 0", async function () {
      const tx = await marketplace
        .connect(creator)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, 0, false);

      await expect(tx).to.emit(marketplace, "AssetCreated");

      const asset = await marketplace.getAsset(1);
      expect(asset.forSale).to.be.false;
      expect(asset.price).to.equal(0);
      expect(await nftContract.ownerOf(1)).to.equal(creator.address);
    });

    it("Should reject registration with empty name", async function () {
      await expect(
        marketplace
          .connect(creator)
          .createAndListAsset("", sampleDesc, sampleCategory, sampleImg, samplePrice, true)
      ).to.be.revertedWithCustomError(marketplace, "EmptyString");
    });
  });

  describe("Listing and Unlisting", function () {
    beforeEach(async function () {
      await marketplace
        .connect(creator)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, 0, false);
    });

    it("Should allow the owner to list an asset for sale", async function () {
      const tx = await marketplace.connect(creator).listAsset(1, samplePrice);

      await expect(tx).to.emit(marketplace, "AssetListed");

      const asset = await marketplace.getAsset(1);
      expect(asset.forSale).to.be.true;
      expect(asset.price).to.equal(samplePrice);
    });

    it("Should reject listing if price is 0", async function () {
      await expect(
        marketplace.connect(creator).listAsset(1, 0)
      ).to.be.revertedWithCustomError(marketplace, "PriceMustBeGreaterThanZero");
    });

    it("Should allow the owner to unlist an asset", async function () {
      await marketplace.connect(creator).listAsset(1, samplePrice);

      const tx = await marketplace.connect(creator).cancelListing(1);
      await expect(tx).to.emit(marketplace, "ListingCancelled");

      const asset = await marketplace.getAsset(1);
      expect(asset.forSale).to.be.false;
    });

    it("Should reject listing and unlisting from non-owner", async function () {
      await expect(
        marketplace.connect(buyer).listAsset(1, samplePrice)
      ).to.be.revertedWithCustomError(marketplace, "NotOwner");

      await marketplace.connect(creator).listAsset(1, samplePrice);

      await expect(
        marketplace.connect(buyer).cancelListing(1)
      ).to.be.revertedWithCustomError(marketplace, "NotOwner");
    });
  });

  describe("Buying Assets", function () {
    beforeEach(async function () {
      await marketplace
        .connect(creator)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, samplePrice, true);
    });

    it("Should successfully execute purchase, transfer funds and ownership", async function () {
      const sellerInitialBal = await ethers.provider.getBalance(creator.address);

      const buyTx = await marketplace.connect(buyer).buyAsset(1, { value: samplePrice });

      await expect(buyTx)
        .to.emit(marketplace, "AssetPurchased")
        .withArgs(1, buyer.address, creator.address, samplePrice, (await ethers.provider.getBlock("latest"))!.timestamp);

      const asset = await marketplace.getAsset(1);
      expect(asset.currentOwner).to.equal(buyer.address);
      expect(asset.forSale).to.be.false;
      expect(await nftContract.ownerOf(1)).to.equal(buyer.address);

      const sellerFinalBal = await ethers.provider.getBalance(creator.address);
      expect(sellerFinalBal - sellerInitialBal).to.equal(samplePrice);
    });

    it("Should refund excess payment when buyer overpays", async function () {
      const overpaidAmount = ethers.parseEther("1.5");
      const buyerInitialBal = await ethers.provider.getBalance(buyer.address);

      const tx = await marketplace.connect(buyer).buyAsset(1, { value: overpaidAmount });
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      const buyerFinalBal = await ethers.provider.getBalance(buyer.address);
      expect(buyerInitialBal - buyerFinalBal - gasCost).to.equal(samplePrice);
    });

    it("Should reject purchase if asset is not for sale", async function () {
      await marketplace.connect(creator).cancelListing(1);

      await expect(
        marketplace.connect(buyer).buyAsset(1, { value: samplePrice })
      ).to.be.revertedWithCustomError(marketplace, "AssetNotForSale");
    });

    it("Should reject purchase with insufficient funds", async function () {
      const lowPrice = ethers.parseEther("0.5");
      await expect(
        marketplace.connect(buyer).buyAsset(1, { value: lowPrice })
      ).to.be.revertedWithCustomError(marketplace, "InsufficientPayment");
    });

    it("Should reject purchase by current owner", async function () {
      await expect(
        marketplace.connect(creator).buyAsset(1, { value: samplePrice })
      ).to.be.revertedWithCustomError(marketplace, "CannotBuyOwnAsset");
    });
  });

  describe("Direct Transfers", function () {
    beforeEach(async function () {
      await marketplace
        .connect(creator)
        .createAndListAsset(sampleName, sampleDesc, sampleCategory, sampleImg, samplePrice, true);
    });

    it("Should successfully transfer an asset directly to another address", async function () {
      const tx = await marketplace.connect(creator).transferAsset(1, user3.address);

      await expect(tx).to.emit(marketplace, "AssetTransferred");

      const asset = await marketplace.getAsset(1);
      expect(asset.currentOwner).to.equal(user3.address);
      expect(asset.forSale).to.be.false;
      expect(await nftContract.ownerOf(1)).to.equal(user3.address);
    });

    it("Should reject direct transfer from non-owner", async function () {
      await expect(
        marketplace.connect(buyer).transferAsset(1, user3.address)
      ).to.be.revertedWithCustomError(marketplace, "NotOwner");
    });

    it("Should reject transfer to zero address or self", async function () {
      await expect(
        marketplace.connect(creator).transferAsset(1, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(marketplace, "InvalidAddress");

      await expect(
        marketplace.connect(creator).transferAsset(1, creator.address)
      ).to.be.revertedWithCustomError(marketplace, "InvalidAddress");
    });
  });

  describe("Bulk Queries and Ownership Views", function () {
    beforeEach(async function () {
      await marketplace
        .connect(creator)
        .createAndListAsset("Asset 1", sampleDesc, sampleCategory, sampleImg, samplePrice, true);
      await marketplace
        .connect(creator)
        .createAndListAsset("Asset 2", sampleDesc, sampleCategory, sampleImg, ethers.parseEther("2.0"), true);
      await marketplace
        .connect(buyer)
        .createAndListAsset("Asset 3", sampleDesc, sampleCategory, sampleImg, 0, false);
    });

    it("Should return all assets correctly via getAllAssets", async function () {
      const assets = await marketplace.getAllAssets();
      expect(assets.length).to.equal(3);
      expect(assets[0].name).to.equal("Asset 1");
      expect(assets[1].name).to.equal("Asset 2");
      expect(assets[2].name).to.equal("Asset 3");
    });

    it("Should return assets filtered by owner via getAssetsByOwner", async function () {
      const topHolders = await marketplace.getTopHolders();
      expect(topHolders.length).to.be.greaterThanOrEqual(2);
      expect(topHolders[0].holder).to.equal(creator.address);
      expect(topHolders[0].assetCount).to.equal(2);
    });

    it("Should return accurate total assets count", async function () {
      const stats = await marketplace.getMarketplaceStats();
      expect(stats.totalAssets).to.equal(3);
      expect(stats.assetsForSale).to.equal(2);
      expect(stats.uniqueOwnersCount).to.equal(2);
    });
  });
});
