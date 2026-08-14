import contractAddresses from "@/contracts/contract-address.json";
import DigitalAssetNFTArtifact from "@/contracts/DigitalAssetNFT.json";
import MarketplaceArtifact from "@/contracts/Marketplace.json";

export const CONTRACT_ADDRESSES = contractAddresses || {
  nftContractAddress: "0x0454B624615e971Bdc15e2Bcc2A7D773b45DeC56",
  marketplaceAddress: "0xAb5D4B3Dc4b1b1CD4BA013346e185b6624E8cF53",
  chainId: "11155111",
};

export const DIGITAL_ASSET_NFT_ABI: any = DigitalAssetNFTArtifact.abi || [];
export const MARKETPLACE_ABI: any = MarketplaceArtifact.abi || [];
