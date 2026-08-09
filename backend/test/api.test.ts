import request from "supertest";
import app from "../src/app";
import { ethers } from "ethers";

describe("Web3 Record Registry API Integration Tests", () => {
  let wallet: ethers.HDNodeWallet;
  let jwtToken: string;

  beforeAll(() => {
    wallet = ethers.Wallet.createRandom();
  });

  describe("GET /health", () => {
    it("should return 200 OK and healthy status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("healthy");
      expect(res.body.service).toBe("web3-record-registry-api");
    });
  });

  describe("POST /api/v1/auth/nonce", () => {
    it("should generate a signing nonce for a valid Ethereum address", async () => {
      const res = await request(app)
        .post("/api/v1/auth/nonce")
        .send({ address: wallet.address });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.address).toBe(wallet.address.toLowerCase());
      expect(res.body.data.nonce).toContain("Sign this message");
    });

    it("should reject an invalid Ethereum address format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/nonce")
        .send({ address: "invalid-address" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/verify-signature", () => {
    it("should verify valid signature and issue JWT token", async () => {
      // 1. Get Nonce
      const nonceRes = await request(app)
        .post("/api/v1/auth/nonce")
        .send({ address: wallet.address });

      const nonce = nonceRes.body.data.nonce;

      // 2. Sign nonce message with private key
      const signature = await wallet.signMessage(nonce);

      // 3. Verify signature
      const verifyRes = await request(app)
        .post("/api/v1/auth/verify-signature")
        .send({
          address: wallet.address,
          signature,
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.token).toBeDefined();
      expect(verifyRes.body.data.user.address).toBe(wallet.address.toLowerCase());

      jwtToken = verifyRes.body.data.token;
    });

    it("should reject an invalid signature", async () => {
      const nonceRes = await request(app)
        .post("/api/v1/auth/nonce")
        .send({ address: wallet.address });

      const fakeSignature = "0x" + "11".repeat(65);

      const verifyRes = await request(app)
        .post("/api/v1/auth/verify-signature")
        .send({
          address: wallet.address,
          signature: fakeSignature,
        });

      expect(verifyRes.status).toBe(401);
      expect(verifyRes.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/records", () => {
    it("should return empty list with pagination metadata", async () => {
      const res = await request(app).get("/api/v1/records");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });
  });

  describe("POST /api/v1/records/sync", () => {
    it("should require authentication token", async () => {
      const res = await request(app)
        .post("/api/v1/records/sync")
        .send({
          onChainId: "0x123",
          ownerAddress: wallet.address,
          title: "Test",
          contentHash: "QmHash",
          category: "General",
        });

      expect(res.status).toBe(401);
    });

    it("should sync record successfully when authenticated", async () => {
      const onChainId = "0x" + "ab".repeat(32);
      const res = await request(app)
        .post("/api/v1/records/sync")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          onChainId,
          ownerAddress: wallet.address,
          title: "Contract Agreement #101",
          contentHash: "QmTestIpfsCidString123456789",
          category: "Legal",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.onChainId).toBe(onChainId);
      expect(res.body.data.title).toBe("Contract Agreement #101");
    });
  });
});
