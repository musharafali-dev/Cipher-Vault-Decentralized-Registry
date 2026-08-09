# API Documentation Reference

Base URL: `http://localhost:5000/api/v1`

---

## 1. System Health

### `GET /health` or `GET /api/v1/health`
Checks server uptime and SQLite/PostgreSQL database connection status.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "web3-record-registry-api",
  "uptime": 142.5,
  "timestamp": "2026-08-10T00:00:00.000Z",
  "database": "connected"
}
```

---

## 2. Authentication (SIWE - Sign-In With Ethereum)

### `POST /api/v1/auth/nonce`
Requests a dynamic nonce message for a wallet address.

**Request Body:**
```json
{
  "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    "nonce": "Sign this message to authenticate with Decentralized Record Registry: 482910481-1723245600000"
  }
}
```

---

### `POST /api/v1/auth/verify-signature`
Verifies cryptographic wallet signature against the stored nonce and issues a JWT token.

**Request Body:**
```json
{
  "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "signature": "0x8f2d4e1a3b5c..."
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "u-uuid-101",
      "address": "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      "role": "USER",
      "createdAt": "2026-08-10T00:00:00.000Z"
    }
  }
}
```

---

## 3. User Profiles

### `GET /api/v1/users/profile`
Fetches authenticated user's profile and active record history.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

### `PUT /api/v1/users/profile`
Updates user metadata off-chain.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

**Request Body:**
```json
{
  "name": "Alex Web3 Dev",
  "email": "alex@example.com",
  "avatar": "https://example.com/avatar.png",
  "bio": "Senior Blockchain & Full Stack Engineer"
}
```

---

## 4. Record Indexer

### `GET /api/v1/records`
Fetches cached smart contract records with optional search, category filtering, and pagination.

**Query Parameters:**
- `category`: string (optional, e.g. "Legal")
- `search`: string (optional)
- `page`: number (default: 1)
- `limit`: number (default: 10)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rec-101",
      "onChainId": "0x3a5b...",
      "ownerAddress": "0x7099...",
      "title": "Medical Record #104",
      "contentHash": "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      "category": "Medical",
      "isActive": true,
      "createdAt": "2026-08-10T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### `POST /api/v1/records/sync`
Syncs on-chain record events with the backend cache.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
