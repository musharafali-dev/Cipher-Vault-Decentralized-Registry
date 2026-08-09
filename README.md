# CipherVault | Enterprise Web3 Decentralized Record Registry dApp

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0.2-4E5EE4?logo=openzeppelin)](https://openzeppelin.com/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow?logo=hardhat)](https://hardhat.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.18-2D3748?logo=prisma)](https://prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A premium, enterprise-grade Web3 Decentralized Record & Asset Metadata Management application built following **SOLID principles**, **Clean Architecture**, and **Security Best Practices**.

---

## Key Features

- **Immutable Solidity Smart Contract**: Custom gas-optimized registry contract enforcing OpenZeppelin `Ownable 5.0` access control and `ReentrancyGuard`.
- **Sign-In With Ethereum (SIWE)**: Cryptographic wallet authentication using Ethers.js v6 message signatures and JWT token sessions.
- **Full On-Chain CRUD Engine**: Create, update, soft-delete, and query record entries and IPFS content hashes.
- **Express & Prisma API Indexer**: Caches on-chain events and record metadata for instant sub-second searching, filtering, and pagination.
- **Dark Mode Glassmorphic dApp UI**: Modern responsive design with neon glows, Framer Motion micro-animations, and live toast notifications.
- **100% Test Coverage**: Complete Hardhat/Chai unit test suite for smart contracts and Supertest/Jest integration tests for backend APIs.

---

## Technology Stack

### Blockchain Layer
- **Language**: Solidity `0.8.24` (Paris EVM compilation target)
- **Framework**: Hardhat
- **Security Standard**: OpenZeppelin Contracts `5.0.2` (`Ownable`, `ReentrancyGuard`)
- **Web3 Library**: Ethers.js `v6.13.2`

### Backend API & Database Layer
- **Runtime**: Node.js + Express + TypeScript
- **ORM**: Prisma ORM `5.18`
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Security & Logging**: Helmet, CORS, Morgan, JWT, Zod Validation

### Frontend dApp Layer
- **Framework**: Next.js 14 App Router + React 18
- **Styling**: Tailwind CSS + Custom Glassmorphic Utilities
- **State Management**: Zustand 4 font-persisted store
- **Icons & UI**: Lucide React + Sonner Toasts

---

## Quick Start

### Prerequisites
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`
- MetaMask browser extension

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/user/cipher-vault-web3.git
cd web3-project

# 2. Install Smart Contracts dependencies & Run Unit Tests
cd contracts
npm install
npx hardhat test

# 3. Deploy Smart Contract to Local Node
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.ts --network localhost

# 4. Install & Run Backend API
cd ../backend
npm install
npx prisma db push
npm test
npm run dev

# 5. Install & Run Frontend dApp
cd ../frontend
npm install --legacy-peer-deps
npm run dev
```

Visit `http://localhost:3000` to launch the dApp.

---

## Project Documentation

- [INSTALLATION.md](file:///c:/Users/hp/Downloads/web3%20project/INSTALLATION.md): Detailed environment configuration and step-by-step setup guide.
- [ARCHITECTURE.md](file:///c:/Users/hp/Downloads/web3%20project/ARCHITECTURE.md): System architecture diagrams and contract design patterns.
- [FOLDER_STRUCTURE.md](file:///c:/Users/hp/Downloads/web3%20project/FOLDER_STRUCTURE.md): Directory layout breakdown across modules.
- [API_DOCUMENTATION.md](file:///c:/Users/hp/Downloads/web3%20project/API_DOCUMENTATION.md): Comprehensive REST API endpoint reference.
- [DEPLOYMENT_GUIDE.md](file:///c:/Users/hp/Downloads/web3%20project/DEPLOYMENT_GUIDE.md): Guide for deploying smart contracts to Sepolia, Backend to Render, and Frontend to Vercel.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
