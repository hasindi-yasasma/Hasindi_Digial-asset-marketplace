import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("==================================================");
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  console.log("==================================================");

  // 1. Deploy DigitalAssetNFT
  const DigitalAssetNFTFactory = await ethers.getContractFactory("DigitalAssetNFT");
  const nftContract = await DigitalAssetNFTFactory.deploy(deployer.address);
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log("DigitalAssetNFT deployed to:", nftAddress);

  // 2. Deploy Marketplace
  const MarketplaceFactory = await ethers.getContractFactory("Marketplace");
  const marketplaceContract = await MarketplaceFactory.deploy(nftAddress, deployer.address);
  await marketplaceContract.waitForDeployment();
  const marketplaceAddress = await marketplaceContract.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddress);

  // 3. Link Marketplace on DigitalAssetNFT
  const tx = await nftContract.setMarketplaceAddress(marketplaceAddress);
  await tx.wait();
  console.log("Linked Marketplace address on DigitalAssetNFT contract");

  // 4. Save Artifacts and Addresses to src/contracts
  const deploymentData = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    nftContractAddress: nftAddress,
    marketplaceAddress: marketplaceAddress,
    deployedAt: new Date().toISOString()
  };

  const nftArtifact = await ethers.getContractFactory("DigitalAssetNFT");
  const marketplaceArtifact = await ethers.getContractFactory("Marketplace");

  const srcContractsDir = path.join(process.cwd(), "src/contracts");

  if (!fs.existsSync(srcContractsDir)) {
    fs.mkdirSync(srcContractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(srcContractsDir, "contract-address.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  fs.writeFileSync(
    path.join(srcContractsDir, "DigitalAssetNFT.json"),
    JSON.stringify({ abi: JSON.parse(nftArtifact.interface.formatJson()) }, null, 2)
  );
  fs.writeFileSync(
    path.join(srcContractsDir, "Marketplace.json"),
    JSON.stringify({ abi: JSON.parse(marketplaceArtifact.interface.formatJson()) }, null, 2)
  );

  console.log("Saved contract addresses and ABIs to src/contracts/");
  console.log("==================================================");
  console.log("Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
