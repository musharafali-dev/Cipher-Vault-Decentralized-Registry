# Enterprise Security Policy & Audit Specifications

## Cipher Vault Decentralized Registry Security Framework

This document outlines the security architecture, threat model, smart contract audit standards, and authentication parameters implemented in **Cipher Vault Decentralized Registry**.

---

## 1. Smart Contract Hardening (`DecentralizedRecordRegistry.sol`)

### 1.1 OpenZeppelin Standard Modules
- **`ReentrancyGuard`**: Protects all state-changing functions against reentrancy attacks (`createRecord`, `updateRecord`, `deleteRecord`, `grantTemporaryAccess`).
- **`Pausable`**: Provides an emergency circuit-breaker mechanism allowing `PAUSER_ROLE` to freeze record creations and updates during security incidents.
- **`AccessControl`**: Role-based access control (RBAC) enforcing granular privileges:
  - `DEFAULT_ADMIN_ROLE`: Contract owner & admin management.
  - `SECURITY_ADMIN_ROLE`: Unpause operations, security alert triggers, emergency deletion.
  - `PAUSER_ROLE`: Emergency contract pause rights.
  - `AUDITOR_ROLE`: Read-access to detailed security audit logs.

### 1.2 Gas Griefing & DoS Boundary Limits
To prevent Block Gas Limit Denial-of-Service attacks via oversized payloads:
- `MAX_TITLE_LENGTH`: 128 bytes
- `MAX_CATEGORY_LENGTH`: 64 bytes
- `MAX_CONTENT_HASH_LENGTH`: 256 bytes
- `COOLDOWN_PERIOD`: 3 seconds per wallet address

---

## 2. Backend API Security (`Express + Prisma`)

### 2.1 Sign-In With Ethereum (SIWE / EIP-4361)
- Nonce generation incorporates random entropy and UTC timestamps.
- **5-Minute Nonce TTL Window**: Nonces expire after 300 seconds to prevent stale signature authentication attempts.
- **Single-Use Nonce Refresh**: Nonce is regenerated immediately upon verification to eliminate signature replay attacks.

### 2.2 API Rate Limiting & DoS Protection
- `rateLimiter` middleware restricts requests to `/api/v1/auth/nonce` and `/api/v1/auth/verify-signature` to 100 requests per 15-minute window per IP.
- `express.json({ limit: "1mb" })` enforces strict payload size limits to mitigate buffer overflow vulnerabilities.

### 2.3 Helmet Security Headers & Sanitization
- `Content-Security-Policy`: Restricts inline script execution and asset fetching.
- `X-Frame-Options: DENY`: Defends against clickjacking.
- `X-Content-Type-Options: nosniff`: Prevents MIME type sniffing.
- `payloadSanitizer`: Strips HTML tags, `<script>` tags, and XSS vectors from request bodies and query parameters.

---

## 3. Frontend Web Application (`Next.js App Router`)

### 3.1 Security Operations Center (`/security`)
- Interactive dashboard for live monitoring of contract state, SIWE session validity, and audit event logs.
- Client-side input sanitizer (`sanitizeInput`) and IPFS CID cryptographic inspector (`isValidIPFSHash`).

---

## 4. Reporting Vulnerabilities
If you discover a potential security flaw in Cipher Vault, please report it via encrypted email to:
`security@cipher-vault.io`
