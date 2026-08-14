// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DigitalAssetNFT
 * @notice ERC-721 Token for representing ownership of digital assets.
 */
contract DigitalAssetNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    address public marketplaceAddress;

    error UnauthorizedMarketplace();
    error ZeroAddress();

    event MarketplaceAddressUpdated(address indexed marketplace);
    event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);

    constructor(address initialOwner) ERC721("DigitalAssetNFT", "DANFT") Ownable(initialOwner) {
        _nextTokenId = 1;
    }

    /**
     * @dev Set marketplace address permitted to mint and transfer tokens.
     */
    function setMarketplaceAddress(address _marketplace) external onlyOwner {
        if (_marketplace == address(0)) revert ZeroAddress();
        marketplaceAddress = _marketplace;
        emit MarketplaceAddressUpdated(_marketplace);
    }

    /**
     * @dev Automatically approve marketplace contract to transfer tokens on behalf of users.
     */
    function isApprovedForAll(address owner, address operator) public view virtual override(ERC721, IERC721) returns (bool) {
        if (operator == marketplaceAddress && marketplaceAddress != address(0)) {
            return true;
        }
        return super.isApprovedForAll(owner, operator);
    }

    /**
     * @dev Mint a new token with metadata URI.
     */
    function mintToken(address recipient, string memory tokenURI) external returns (uint256) {
        if (msg.sender != owner() && msg.sender != marketplaceAddress) {
            revert UnauthorizedMarketplace();
        }
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        emit NFTMinted(tokenId, recipient, tokenURI);
        return tokenId;
    }

    function getCurrentTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
}
