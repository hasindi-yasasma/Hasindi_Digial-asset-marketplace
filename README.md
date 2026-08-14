# Decentralized Digital Asset Marketplace DApp

An industry-quality, end-to-end Decentralized Digital Asset Marketplace DApp built with **Solidity**, **Hardhat**, **OpenZeppelin**, **Ethers.js v6**, **Node.js/Express with Swagger OpenAPI**, and **React + Vite + TypeScript + Tailwind CSS**.

This application allows users to mint ERC-721 digital asset tokens, list assets for sale, purchase assets using ETH, transfer ownership directly, and maintain complete, immutable ownership history directly on the Ethereum blockchain.

> [!IMPORTANT]
> **Zero Database Requirement**: The smart contract on the blockchain serves as the single source of truth for all assets, listings, transactions, ownership history, and holder statistics. Absolutely no external databases (MySQL, MongoDB, PostgreSQL, Firebase, Supabase) or third-party BaaS are used.

---

## 🌟 Key Features

- ✔ **Digital Asset Minting & Registration**: Define asset title, description, category, image URL, and price to mint ERC-721 tokens on-chain.
- ✔ **Decentralized Marketplace**: List, buy, and sell digital assets with instant ownership transfer and ETH payment routing.
- ✔ **P2P Direct Ownership Transfer**: Transfer digital assets directly to any valid Ethereum wallet address.
- ✔ **Immutable Provenance & Ownership History**: Complete lifecycle event logging (Mint, List, Sale, Transfer, Cancel, PriceUpdate).
- ✔ **Analytics & Leaderboard**: Real-time stats dashboard (Total Assets, Assets For Sale, Assets Sold, Total Volume, Unique Owners, Top 10 Holders Leaderboard).
- ✔ **MetaMask Integration**: Automatic network detection (Hardhat Localhost `31337` & Ethereum Sepolia `11155111`), chain switching, and balance display.
- ✔ **Swagger OpenAPI 3.0 Documentation**: Interactive API documentation at `/api-docs` served by Express.

---

## 🏗️ Architecture & Tech Stack

```
Decentralized Digital Asset Marketplace
├── contracts/
│   ├── DigitalAssetNFT.sol     # ERC-721 Token using OpenZeppelin standards
│   └── Marketplace.sol         # Core marketplace with security & statistics
├── scripts/
│   └── deploy.ts               # Hardhat deployment script & ABI generator
├── test/
│   └── Marketplace.test.ts     # Comprehensive Hardhat unit test suite
├── server/                     # Express REST API backend reading blockchain state
│   ├── src/
│   │   ├── index.ts            # Server entry point & Swagger UI mounting
│   │   ├── swagger.ts          # OpenAPI 3.0 specification
│   │   ├── routes/             # REST endpoints (/api/assets, /api/dashboard, etc.)
│   │   └── services/           # Ethers.js v6 JsonRpcProvider contract service
│   ├── package.json
│   └── tsconfig.json
├── client/                     # React + Vite + TypeScript + Tailwind CSS DApp
│   ├── src/
│   │   ├── components/         # Navbar, Footer, AssetCard, Modal, StatsCard, Toast
│   │   ├── context/            # Web3Context managing MetaMask provider & signer
│   │   ├── pages/              # Home, Marketplace, CreateAsset, Details, MyAssets, etc.
│   │   ├── services/           # API client service
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Formatters & Contract addresses
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── hardhat.config.ts           # Hardhat configuration
├── package.json                # Root monorepo orchestrator
└── README.md                   # Complete documentation
```

### Stack Components

| Layer | Technologies |
| :--- | :--- |
| **Smart Contracts** | Solidity `^0.8.20`, Hardhat, OpenZeppelin Contracts v5 |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Ethers.js v6, Lucide React, React Router v6 |
| **Backend** | Node.js, Express, Swagger OpenAPI 3.0, Swagger UI Express, CORS |
| **Wallet** | MetaMask (EIP-1193) |
| **Database** | **NONE** (Blockchain is single source of truth) |

---

## 🔒 Security, Gas Optimization & Trust Model

### 1. Smart Contract Security
- **ReentrancyGuard Protection**: Uses OpenZeppelin's `nonReentrant` modifier on state-changing functions (`buyAsset`, `createAndListAsset`, `transferAsset`, `listAsset`).
- **Checks-Effects-Interactions Pattern**: State updates (ownership, sale status, volume counters) are performed **before** any external ETH payments or ERC-721 token transfers occur.
- **Custom Solidity Errors**: Uses custom errors (`NotOwner`, `PriceMustBeGreaterThanZero`, `AssetNotForSale`, `InsufficientPayment`, `AlreadyListed`, `CannotBuyOwnAsset`) to minimize gas usage and revert gracefully.
- **Ownable Access Control**: Administrative functions are restricted to contract deployer signatures.

### 2. Gas Optimization Considerations
- **Compiler Optimizer Enabled**: Solidity compiler configuration enables `runs: 200` for compact bytecode.
- **Memory vs. Storage**: Returns array structs in `memory` during `view` function execution (`getAllAssets`, `getOwnershipHistory`, `getMarketplaceStats`, `getTopHolders`) to avoid unnecessary storage operations (`SLOAD` / `SSTORE`).

### 3. Scalability & Decentralized Trust
- **Off-Chain Media Indexing**: Image URLs are saved on-chain without storing bloated binary assets inside smart contract storage.
- **Stateless Express Helper**: Express server acts strictly as an RPC reader via Ethers.js v6, exposing structured JSON endpoints and Swagger UI without state duplication or databases.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or later
- **MetaMask Browser Extension**: Installed in Chrome, Brave, Firefox, or Edge

### 1. Install Dependencies

In the root directory, run:
```bash
npm install
cd client && npm install && cd ../server && npm install && cd ..
```

### 2. Compile Smart Contracts & Run Tests

Compile Solidity contracts:
```bash
npx hardhat compile
```

Execute Hardhat unit tests:
```bash
npx hardhat test
```

### 3. Start Local Blockchain Node & Deploy Contracts

Terminal 1 - Launch local Ethereum node:
```bash
npx hardhat node
```

Terminal 2 - Deploy smart contracts to local network:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```
*This automatically deploys `DigitalAssetNFT` and `Marketplace` contracts and exports ABIs and addresses to both `client/src/contracts/` and `server/src/contracts/`.*

### 4. Launch Backend API Server

Terminal 3 - Start Express API server:
```bash
npm run server
```
- API Server runs at: `http://localhost:5000`
- Interactive Swagger UI available at: `http://localhost:5000/api-docs`

### 5. Launch React Frontend DApp

Terminal 4 - Start Vite React development server:
```bash
npm run client
```
- Frontend application runs at: `http://localhost:3000`

---

## 🌐 Express API Endpoints & Swagger

The Express backend exposes the following REST endpoints documented via Swagger at `/api-docs`:

- `GET /api/health` - Check RPC connection and contract deployment health.
- `GET /api/assets` - Retrieve all registered digital assets.
- `GET /api/assets/:id` - Retrieve single asset details by token ID.
- `GET /api/dashboard` - Retrieve aggregate marketplace volume and statistics.
- `GET /api/history/:id` - Retrieve immutable ownership history for an asset.
- `GET /api/top-holders` - Retrieve top 10 asset holders ranking.
- `GET /api/transactions` - Retrieve all smart contract transaction events.

---

## 🧪 Testing Coverage

The Hardhat unit test suite (`test/Marketplace.test.ts`) tests:
- [x] Asset creation & ERC-721 minting (`createAndListAsset`)
- [x] Listing unlisted assets (`listAsset`)
- [x] Asset purchasing & ETH payment routing (`buyAsset`)
- [x] Updating listing prices (`updateListingPrice`)
- [x] Listing cancellation (`cancelListing`)
- [x] Direct P2P ownership transfer (`transferAsset`)
- [x] Immutable ownership history logging (`getOwnershipHistory`)
- [x] Reentrancy protection & custom error reverts (`CannotBuyOwnAsset`, `PriceMustBeGreaterThanZero`, `InsufficientPayment`)
- [x] Marketplace statistics and top holders algorithm (`getMarketplaceStats`, `getTopHolders`)

---

## 📄 License

MIT License. Developed for University Decentralized Application & Blockchain Fundamentals Curriculum.
