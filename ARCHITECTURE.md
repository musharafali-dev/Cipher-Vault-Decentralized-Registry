# System Architecture & Technical Specifications

The **CipherVault Web3 Record Registry** is built using a **Clean Architecture** model, enforcing strict separation of concerns across on-chain contract logic, off-chain indexing services, and frontend state management.

---

## High-Level Architecture Diagram

```mermaid
graph TD
    User["Web3 User / Browser"]
    MetaMask["MetaMask / Web3 Wallet"]
    Frontend["Next.js 14 Frontend\n(React 18, Tailwind, Zustand, Ethers v6)"]
    Contract["DecentralizedRecordRegistry.sol\n(OpenZeppelin 5.0, ReentrancyGuard, Ownable)"]
    Backend["Express.js API Backend\n(TypeScript, JWT, SIWE Auth)"]
    Prisma["Prisma ORM"]
    DB[(SQLite / PostgreSQL DB)]

    User -->|"Interacts via UI"| Frontend
    Frontend <-->|"Request Accounts / Sign Nonce"| MetaMask
    MetaMask <-->|"Execute Contract Transactions"| Contract
    Frontend <-->|"REST API Requests / JWT Auth"| Backend
    Backend <-->|"Data Queries / Index Sync"| Prisma
    Prisma <-->|SQL| DB
```

---

## Core Components Breakdown

### 1. Smart Contract Layer (`DecentralizedRecordRegistry.sol`)
- **Immutability & Safety**: Built with Solidity `0.8.24`. Inherits OpenZeppelin `Ownable` for contract admin operations and `ReentrancyGuard` to defend against reentrant state manipulation.
- **Gas Optimization**: Custom errors (`RecordNotFound`, `NotRecordOwner`, `InvalidInput`, `RecordAlreadyExists`, `RecordIsInactive`) save up to 20,000 gas per revert compared to string `require()` statements.
- **NatSpec Documentation**: Full NatSpec comments `@notice`, `@dev`, `@param`, `@return` on all functions.
- **Event Logging**: Emits `RecordCreated`, `RecordUpdated`, and `RecordDeleted` indexed events.

### 2. Authentication Flow (SIWE - Sign-In With Ethereum)

```mermaid
sequenceDiagram
    autonumber
    actor User as Web3 Wallet User
    participant App as Next.js Frontend
    participant API as Express Backend
    participant DB as Prisma Database

    User->>App: Click "Connect Wallet"
    App->>API: GET /api/v1/auth/nonce?address=0x...
    API->>DB: Find or create User record
    API-->>App: Return random nonce message string
    App->>User: Prompt wallet signature request (eth_signMessage)
    User-->>App: Return cryptographic signature
    App->>API: POST /api/v1/auth/verify-signature { address, signature }
    API->>API: Verify ethers.verifyMessage(nonce, signature)
    API->>DB: Refresh user nonce (prevent signature replay)
    API-->>App: Return JWT Bearer token & User profile
    App->>App: Save JWT & User in Zustand persistent store
```

### 3. Off-Chain Indexing & Caching Strategy
- Reading raw contract arrays over JSON-RPC can become slow with thousands of entries.
- The Express backend operates an indexer sync endpoint (`POST /api/v1/records/sync`) which caches on-chain records into a fast relational database (`RecordCache` table in Prisma).
- Frontend queries indexed records for Instant Full-Text Search, Category Filtering, and Pagination, while verifying record state directly against smart contract getters.

---

## Security Audit Safeguards

1. **Reentrancy Protection**: All state-modifying contract functions (`createRecord`, `updateRecord`, `deleteRecord`) are guarded with OpenZeppelin `nonReentrant`.
2. **Access Control**: Record updates and soft deletions verify `record.owner == msg.sender` before mutating storage.
3. **Replay Attack Prevention**: Nonces are invalidated immediately upon successful wallet signature verification.
4. **CORS & Helmet Protection**: Express API uses security headers via `helmet()` and strict CORS domain whitelisting.
