import { expect } from "chai";
import { ethers } from "hardhat";
import { DecentralizedRecordRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DecentralizedRecordRegistry", function () {
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

  describe("Deployment", function () {
    it("Should set the correct deployer as initial owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero total records", async function () {
      expect(await registry.getRecordCount()).to.equal(0);
    });
  });

  describe("Record Creation", function () {
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

    it("Should increment record counts correctly", async function () {
      await registry.connect(user1).createRecord(testRecordId, sampleTitle, sampleContentHash, sampleCategory);
      expect(await registry.getRecordCount()).to.equal(1);

      const userRecords = await registry.getUserRecords(user1.address);
      expect(userRecords.length).to.equal(1);
      expect(userRecords[0]).to.equal(testRecordId);
    });

    it("Should revert if record ID already exists", async function () {
      await registry.connect(user1).createRecord(testRecordId, sampleTitle, sampleContentHash, sampleCategory);

      await expect(
        registry.connect(user1).createRecord(testRecordId, "Duplicate Title", "QmHash", "General")
      )
        .to.be.revertedWithCustomError(registry, "RecordAlreadyExists")
        .withArgs(testRecordId);
    });

    it("Should revert on invalid empty inputs", async function () {
      const zeroBytes32 = ethers.ZeroHash;
      await expect(
        registry.connect(user1).createRecord(zeroBytes32, sampleTitle, sampleContentHash, sampleCategory)
      ).to.be.revertedWithCustomError(registry, "InvalidInput").withArgs("id");

      await expect(
        registry.connect(user1).createRecord(testRecordId, "", sampleContentHash, sampleCategory)
      ).to.be.revertedWithCustomError(registry, "InvalidInput").withArgs("title");

      await expect(
        registry.connect(user1).createRecord(testRecordId, sampleTitle, "", sampleCategory)
      ).to.be.revertedWithCustomError(registry, "InvalidInput").withArgs("contentHash");
    });
  });

  describe("Record Retrieval & Querying", function () {
    beforeEach(async function () {
      await registry.connect(user1).createRecord(testRecordId, sampleTitle, sampleContentHash, sampleCategory);
      await registry.connect(user2).createRecord(testRecordId2, "Legal Agreement", "QmHash2", "Legal");
    });

    it("Should retrieve accurate detailed user records", async function () {
      const user1Recs = await registry.getUserRecordsDetailed(user1.address);
      expect(user1Recs.length).to.equal(1);
      expect(user1Recs[0].title).to.equal(sampleTitle);
    });

    it("Should fetch all active records", async function () {
      const allRecs = await registry.getAllRecords();
      expect(allRecs.length).to.equal(2);
    });

    it("Should revert when querying non-existent record", async function () {
      const fakeId = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
      await expect(registry.getRecord(fakeId))
        .to.be.revertedWithCustomError(registry, "RecordNotFound")
        .withArgs(fakeId);
    });
  });

  describe("Record Updating", function () {
    beforeEach(async function () {
      await registry.connect(user1).createRecord(testRecordId, sampleTitle, sampleContentHash, sampleCategory);
    });

    it("Should allow record owner to update title and contentHash", async function () {
      const newTitle = "Updated Patient Record #1042";
      const newHash = "QmUpdatedContentHash9999999999999999999999999";
      const newCategory = "Medical-Urgent";

      await expect(
        registry.connect(user1).updateRecord(testRecordId, newTitle, newHash, newCategory)
      )
        .to.emit(registry, "RecordUpdated")
        .withArgs(testRecordId, user1.address, newTitle, newCategory, (val: any) => val > 0);

      const record = await registry.getRecord(testRecordId);
      expect(record.title).to.equal(newTitle);
      expect(record.contentHash).to.equal(newHash);
      expect(record.category).to.equal(newCategory);
    });

    it("Should revert when non-owner attempts to update record", async function () {
      await expect(
        registry.connect(user2).updateRecord(testRecordId, "Hacked Title", "HackedHash", "Hacked")
      )
        .to.be.revertedWithCustomError(registry, "NotRecordOwner")
        .withArgs(testRecordId, user2.address);
    });

    it("Should revert when updating a non-existent or inactive record", async function () {
      const fakeId = ethers.keccak256(ethers.toUtf8Bytes("fake"));
      await expect(
        registry.connect(user1).updateRecord(fakeId, "Title", "Hash", "Cat")
      ).to.be.revertedWithCustomError(registry, "RecordNotFound").withArgs(fakeId);

      await registry.connect(user1).deleteRecord(testRecordId);

      await expect(
        registry.connect(user1).updateRecord(testRecordId, "Title", "Hash", "Cat")
      ).to.be.revertedWithCustomError(registry, "RecordIsInactive").withArgs(testRecordId);
    });
  });

  describe("Record Deletion", function () {
    beforeEach(async function () {
      await registry.connect(user1).createRecord(testRecordId, sampleTitle, sampleContentHash, sampleCategory);
    });

    it("Should allow record owner to delete record", async function () {
      await expect(registry.connect(user1).deleteRecord(testRecordId))
        .to.emit(registry, "RecordDeleted")
        .withArgs(testRecordId, user1.address, (val: any) => val > 0);

      const record = await registry.getRecord(testRecordId);
      expect(record.isActive).to.be.false;

      const activeRecords = await registry.getAllRecords();
      expect(activeRecords.length).to.equal(0);
    });

    it("Should allow contract owner to delete inappropriate record", async function () {
      await expect(registry.connect(owner).deleteRecord(testRecordId))
        .to.emit(registry, "RecordDeleted");

      const record = await registry.getRecord(testRecordId);
      expect(record.isActive).to.be.false;
    });

    it("Should revert when unauthorized user tries to delete record", async function () {
      await expect(registry.connect(user2).deleteRecord(testRecordId))
        .to.be.revertedWithCustomError(registry, "NotRecordOwner")
        .withArgs(testRecordId, user2.address);
    });
  });

  describe("Ownership Transfer", function () {
    it("Should allow owner to transfer contract ownership", async function () {
      await registry.connect(owner).transferOwnership(user1.address);
      expect(await registry.owner()).to.equal(user1.address);
    });

    it("Should prevent non-owners from transferring contract ownership", async function () {
      await expect(
        registry.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount").withArgs(user1.address);
    });
  });
});
