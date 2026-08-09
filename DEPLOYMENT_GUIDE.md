# Production Deployment Guide

This guide details deploying the **CipherVault Web3 Record Registry** across production platforms:
1. Smart Contract -> **Sepolia Testnet**
2. Express Backend API -> **Render / Railway**
3. Next.js Frontend -> **Vercel**

---

## 1. Deploying Smart Contract to Sepolia Testnet

### Prerequisites
- Alchemy or Infura Sepolia RPC URL.
- Testnet ETH in your deployer wallet (from Sepolia Faucet).
- Etherscan API Key for contract verification.

### Step 1.1: Configure Environment (`contracts/.env`)
```env
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
PRIVATE_KEY="0xYOUR_DEPLOYER_PRIVATE_KEY"
ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"
```

### Step 1.2: Deploy & Verify
```bash
cd contracts

# Run hardhat deployment script targeting Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Verify contract source code on Etherscan
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

---

## 2. Deploying Express Backend API to Render

### Step 2.1: Prepare PostgreSQL Database
- Create a PostgreSQL database instance on Render or Supabase.
- Obtain the connection string: `postgresql://user:password@host:5432/dbname?sslmode=require`.

### Step 2.2: Configure Render Environment Variables
- `NODE_ENV`: `production`
- `PORT`: `5000`
- `DATABASE_URL`: `<YOUR_POSTGRESQL_CONNECTION_STRING>`
- `JWT_SECRET`: `<STRONG_JWT_SECRET_KEY>`
- `CORS_ORIGIN`: `https://your-dapp.vercel.app`

### Step 2.3: Render Build & Start Commands
- **Build Command**: `cd backend && npm install && npx prisma db push && npm run build`
- **Start Command**: `cd backend && npm run start`

---

## 3. Deploying Next.js Frontend to Vercel

### Step 3.1: Import Project to Vercel
- Connect your GitHub repository to Vercel.
- Set Root Directory to `frontend`.

### Step 3.2: Set Environment Variables in Vercel
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: `<SEPOLIA_DEPLOYED_CONTRACT_ADDRESS>`
- `NEXT_PUBLIC_RPC_URL`: `https://rpc.sepolia.org`
- `NEXT_PUBLIC_API_URL`: `https://your-backend-api.onrender.com/api/v1`

### Step 3.3: Deploy
- Click **Deploy**. Vercel will automatically build the Next.js static and serverless pages.
