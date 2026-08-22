import hre from "hardhat";
import "@nomicfoundation/hardhat-toolbox";
import * as fs from "fs";
import * as path from "path";

const { ethers } = hre;

async function main() {
    const addressFilePath = path.join(process.cwd(), "src/contracts/contract-address.json");
    if (!fs.existsSync(addressFilePath)) {
        console.log("contract-address.json not found.");
        return;
    }

    const contractAddress = JSON.parse(fs.readFileSync(addressFilePath, "utf8"));
    console.log("Checking contract addresses from json:");
    console.log("NFT:", contractAddress.nftContractAddress);
    console.log("Marketplace:", contractAddress.marketplaceAddress);

    const nft = await ethers.getContractAt("DigitalAssetNFT", contractAddress.nftContractAddress);
    const marketplace = await ethers.getContractAt("Marketplace", contractAddress.marketplaceAddress);

    try {
        const nftOwner = await nft.owner();
        console.log("NFT owner:", nftOwner);
        const nftMarketplace = await nft.marketplaceAddress();
        console.log("NFT marketplaceAddress:", nftMarketplace);
    } catch (e: any) {
        console.error("Error reading NFT:", e.message);
    }

    try {
        const marketNft = await marketplace.nftContract();
        console.log("Marketplace nftContract:", marketNft);
        const marketOwner = await marketplace.owner();
        console.log("Marketplace owner:", marketOwner);
    } catch (e: any) {
        console.error("Error reading Marketplace:", e.message);
    }
}

main().catch(console.error);
