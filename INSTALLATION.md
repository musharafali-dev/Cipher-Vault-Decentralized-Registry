# Installation & Setup Guide

This guide provides step-by-step instructions for running the **CipherVault Web3 Decentralized Record Registry** application locally for development and testing.

---

## System Requirements

- **Operating System**: Windows / macOS / Linux
- **Node.js**: Version `18.17.0` or higher
- **Package Manager**: `npm` (v9+) or `yarn` (v1.22+)
- **Browser**: Chrome / Brave / Firefox with MetaMask extension installed.

---

## Step 1: Clone Repository

```bash
git clone https://github.com/user/cipher-vault-web3.git
cd web3-project
```

---

## Step 2: Smart Contract Setup & Local EVM Node

```bash
cd contracts

# Install contract dependencies
npm install

# Compile Solidity contracts
npm run compile

# Run Hardhat unit tests
npm run test

# Start local Hardhat EVM node (runs on http://127.0.0.1:8545)
npx hardhat node
```

In a second terminal window, deploy the contract to your running local node:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

*Note: The deployment script automatically exports the contract ABI and deployed address to `shared/contract-config.json`.*

---

## Step 3: Backend API Setup

```bash
cd ../backend

# Install backend dependencies
npm install

# Push Prisma schema to SQLite database (dev.db)
npx prisma db push

# Run backend API integration tests
npm test

# Start backend server (runs on http://localhost:5000)
npm run dev
```

---

## Step 4: Frontend dApp Setup

```bash
cd ../frontend

# Install frontend dependencies
npm install --legacy-peer-deps

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## Environment Variables Reference

### Smart Contracts (`contracts/.env`)
```env
SEPOLIA_RPC_URL="https://rpc.sepolia.org"
PRIVATE_KEY="0x..."
ETHERSCAN_API_KEY="YOUR_ETHERSCAN_KEY"
```

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_web3_record_registry_2026_prod
JWT_EXPIRES_IN=7d
DATABASE_URL="file:./dev.db"
CORS_ORIGIN="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"
NEXT_PUBLIC_RPC_URL="http://127.0.0.1:8545"
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
```
