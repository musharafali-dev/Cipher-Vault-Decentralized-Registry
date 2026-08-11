import { expect } from "chai";
import { ethers } from "hardhat";
import { DecentralizedRecordRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DecentralizedRecordRegistry - Security & Access Control Test Suite", function () {
  let registry: DecentralizedRecordRegistry;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const testRecordId = ethers.keccak256(ethers.toUtf8Bytes("record-001"));
  const testRecordId2 = ethers.keccak256(ethers.toUtf8Bytes("record-002"));
  const sampleTitle = "Patient Medical History #1042";
  const sampleContentHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
  const sampleCategory = "Medical";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("DecentralizedRecordRegistry");
    registry = await Factory.deploy();
    await registry.waitForDeployment();
  });

  describe("Deployment & Access Roles", function () {
    it("Should set the correct deployer as initial owner and super admin", async function () {
      expect(await registry.owner()).to.equal(owner.address);
      const DEFAULT_ADMIN_ROLE = await registry.DEFAULT_ADMIN_ROLE();
      const SECURITY_ADMIN_ROLE = await registry.SECURITY_ADMIN_ROLE();
      expect(await registry.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await registry.hasRole(SECURITY_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should initialize with zero total records", async function () {
      expect(await registry.getRecordCount()).to.equal(0);
    });
  });

  describe("Record Creation & Input Boundary Protection", function () {
    it("Should create a new record and emit RecordCreated event", async function () {
      await expect(
        registry.connect(user1).createRecord(testRecordId, sampleTitle, sampleContentHash, sampleCategory)
      )
        .to.emit(registry, "RecordCreated")
        .withArgs(testRecordId, user1.address, sampleTitle, sampleCategory, (val: any) => val > 0);

      const record = await registry.getRecord(testRecordId);
      expect(record.id).to.equal(testRecordId);
      expect(record.owner).to.equal(user1.address);
      expect(record.title).to.equal(sampleTitle);
      expect(record.contentHash).to.equal(sampleContentHash);
      expect(record.category).to.equal(sampleCategory);
      expect(record.isActive).to.be.true;
    });

    it("Should reject title payload exceeding MAX_TITLE_LENGTH (128 chars)", async function () {
      const longTitle = "A".repeat(129);
      await expect(
        registry.connect(user1).createRecord(testRecordId, longTitle, sampleContentHash, sampleCategory)
      ).to.be.revertedWithCustomError(registry, "InputExceedsLimit").withArgs("title", 128);
    });

    it("Should reject contentHash exceeding MAX_CONTENT_HASH_LENGTH (256 chars)", async function () {
      const longHash = "Qm" + "B".repeat(255);
      await expect(
        registry.connect(user1).createRecord(testRecordId, sampleTitle, longHash, sampleCategory)
      ).to.be.revertedWithCustomError(registry, "InputExceedsLimit").withArgs("contentHash", 256);
    });
  });

  describe("Pausable Circuit Breaker Protection", function () {
    it("Should allow PAUSER_ROLE to pause contract operations", async function () {
      await registry.connect(owner).pause();
      expect(await registry.paused()).to.be.true;
    });

    it("Should prevent record creation when contract is paused", async function () {
      await registry.connect(owner).pause();
      await expect(
        registry.connect(user1).createRecord(testRecordId, sampleTitle, sampleContentHash, sampleCategory)
      ).to.be.revertedWithCustomError(registry, "EnforcedPause");
    });

    it("Should allow SECURITY_ADMIN_ROLE to unpause contract operations", async function () {
      await registry.connect(owner).pause();
      await registry.connect(owner).unpause();
      expect(await registry.paused()).to.be.false;

      await expect(
        registry.connect(user1).createRecord(testRecordId, sampleTitle, sampleContentHash, sampleCategory)
      ).to.emit(registry, "RecordCreated");
    });
  });

  describe("Temporary Access Delegation", function () {
    beforeEach(async function () {
      await registry.connect(user1).createRecord(testRecordId, sampleTitle, sampleContentHash, sampleCategory);
    });

    it("Should allow owner to grant temporary modification access to delegatee", async function () {
      await registry.connect(user1).grantTemporaryAccess(testRecordId, user2.address, 3600, true);

      const [isValid, canModify, expiresAt] = await registry.checkDelegation(testRecordId, user2.address);
      expect(isValid).to.be.true;
      expect(canModify).to.be.true;
      expect(expiresAt).to.be.gt(0);

      await expect(
        registry.connect(user2).updateRecord(testRecordId, "Delegated Title", "QmNewHash", "Medical")
      ).to.emit(registry, "RecordUpdated");
    });

    it("Should allow owner to revoke temporary access", async function () {
      await registry.connect(user1).grantTemporaryAccess(testRecordId, user2.address, 3600, true);
      await registry.connect(user1).revokeTemporaryAccess(testRecordId, user2.address);

      const [isValid] = await registry.checkDelegation(testRecordId, user2.address);
      expect(isValid).to.be.false;

      await expect(
        registry.connect(user2).updateRecord(testRecordId, "Hacked Title", "QmNewHash", "Medical")
      ).to.be.revertedWithCustomError(registry, "NotRecordOwner");
    });
  });

  describe("Record Deletion & Management", function () {
    beforeEach(async function () {
      await registry.connect(user1).createRecord(testRecordId, sampleTitle, sampleContentHash, sampleCategory);
    });

    it("Should allow record owner to delete record", async function () {
      await expect(registry.connect(user1).deleteRecord(testRecordId))
        .to.emit(registry, "RecordDeleted")
        .withArgs(testRecordId, user1.address, (val: any) => val > 0);

      const record = await registry.getRecord(testRecordId);
      expect(record.isActive).to.be.false;
    });

    it("Should allow SECURITY_ADMIN to soft delete suspicious record", async function () {
      await expect(registry.connect(owner).deleteRecord(testRecordId))
        .to.emit(registry, "RecordDeleted");

      const record = await registry.getRecord(testRecordId);
      expect(record.isActive).to.be.false;
    });
  });
});
