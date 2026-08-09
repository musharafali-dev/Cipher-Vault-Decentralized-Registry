# Comprehensive Project Folder Structure

```
web3-project/
├── contracts/                        # Hardhat & Solidity Smart Contract Module
│   ├── contracts/
│   │   └── DecentralizedRecordRegistry.sol # Main OpenZeppelin smart contract
│   ├── scripts/
│   │   └── deploy.ts                 # Hardhat deployment script & ABI exporter
│   ├── test/
│   │   └── DecentralizedRecordRegistry.test.ts # Hardhat + Chai unit tests
│   ├── hardhat.config.ts             # Hardhat network & compiler configuration
│   ├── tsconfig.json                 # TypeScript config for Hardhat
│   └── package.json                  # Contract module dependencies
│
├── backend/                          # Express REST API & Prisma Indexer Module
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts              # Centralized environment variable loader
│   │   ├── controllers/
│   │   │   ├── authController.ts     # SIWE nonce generation & signature verification
│   │   │   ├── userController.ts     # User profile retrieval & update handlers
│   │   │   └── recordController.ts   # Cached record query & event indexer handlers
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts     # JWT Bearer token authentication guard
│   │   │   └── errorHandler.ts       # Centralized Express error handler
│   │   ├── routes/
│   │   │   ├── authRoutes.ts         # Auth API routes
│   │   │   ├── userRoutes.ts         # User profile routes
│   │   │   └── recordRoutes.ts       # Record query & sync routes
│   │   ├── utils/
│   │   │   ├── auth.ts               # JWT & Ethers signature verify helpers
│   │   │   └── prisma.ts             # PrismaClient singleton instance
│   │   ├── app.ts                    # Express app initialization & middleware
│   │   └── index.ts                  # Server port listener & graceful shutdown
│   ├── prisma/
│   │   ├── dev.db                    # SQLite database instance (development)
│   │   └── schema.prisma             # User, RecordCache, AuditLog models
│   ├── test/
│   │   └── api.test.ts               # Supertest + Jest integration tests
│   ├── jest.config.js                # Jest test runner configuration
│   ├── tsconfig.json                 # Backend TypeScript configuration
│   ├── .env                          # Backend environment variables
│   └── package.json                  # Backend dependencies
│
├── frontend/                         # Next.js 14 Web3 Frontend Module
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages
│   │   │   ├── about/
│   │   │   │   └── page.tsx          # Architecture & Security Specs page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Record management & CRUD table page
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # User profile & wallet details page
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          # Network manager & contract config page
│   │   │   ├── transactions/
│   │   │   │   └── page.tsx          # On-chain transaction explorer page
│   │   │   ├── globals.css           # Tailwind glassmorphism CSS utilities
│   │   │   ├── layout.tsx            # Root layout with Navbar & Footer
│   │   │   └── page.tsx              # Home landing page overview
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx        # Responsive Web3 glassmorphic Navbar
│   │   │   │   └── Footer.tsx        # System specs & contract Footer
│   │   │   └── records/
│   │   │       ├── CreateRecordModal.tsx # On-chain record minting modal
│   │   │       ├── EditRecordModal.tsx   # Record metadata update modal
│   │   │       └── DeleteRecordModal.tsx # Record soft deletion modal
│   │   ├── lib/
│   │   │   └── contract.ts           # Ethers.js v6 contract factory & helpers
│   │   └── store/
│   │       └── useWalletStore.ts     # Zustand Web3 wallet & SIWE auth state
│   ├── next.config.js                # Next.js configuration
│   ├── tailwind.config.js            # Tailwind CSS theme & glow tokens
│   ├── tsconfig.json                 # Frontend TypeScript configuration
│   └── package.json                  # Frontend dependencies
│
├── shared/                           # Shared Artifact Exports
│   └── contract-config.json          # Deployed contract address & ABI output
│
├── ARCHITECTURE.md                   # System architecture documentation
├── API_DOCUMENTATION.md              # REST API endpoint reference
├── DEPLOYMENT_GUIDE.md               # Sepolia, Render, & Vercel deployment guide
├── FOLDER_STRUCTURE.md               # Folder structure map
├── INSTALLATION.md                   # Step-by-step setup guide
└── README.md                         # Project overview
```
