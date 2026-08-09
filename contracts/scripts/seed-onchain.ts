import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Seeding sample records on smart contract...");

  const [deployer, user1, user2] = await ethers.getSigners();
  
  // Read deployed address if available
  const configPath = path.join(__dirname, "../../shared/contract-config.json");
  let contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    contractAddress = parsed.address;
  }

  console.log(`Connecting to DecentralizedRecordRegistry at: ${contractAddress}`);
  const Factory = await ethers.getContractFactory("DecentralizedRecordRegistry");
  const registry = Factory.attach(contractAddress) as any;

  const records = [
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("record-prop-4092")),
      title: "Commercial Real Estate Land Title Deed #4092",
      hash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      category: "Property",
      signer: deployer,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("record-med-802")),
      title: "Genomic Sequencing & Clinical Trial Record #802",
      hash: "QmPZ9gcCEpqKTo6aq61g2nXGUhM4MCL3fKmC282W2vD5am",
      category: "Medical",
      signer: deployer,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("record-leg-104")),
      title: "Enterprise Software Patent & IP Licensing Rights",
      hash: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      category: "Legal",
      signer: user1 || deployer,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("record-fin-2026")),
      title: "Quarterly Financial Escrow Audit & Treasury Report 2026",
      hash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      category: "Financial",
      signer: user1 || deployer,
    },
    {
      id: ethers.keccak256(ethers.toUtf8Bytes("record-id-did")),
      title: "Self-Sovereign Decentralized Identity Credential (DID)",
      hash: "QmNLei78zWmRYZCCNxPA6CeTc22yVJ55vaq548vG2a1y",
      category: "Identity",
      signer: user2 || deployer,
    },
  ];

  for (const r of records) {
    try {
      console.log(`Minting record: "${r.title}"...`);
      const tx = await registry.connect(r.signer).createRecord(r.id, r.title, r.hash, r.category);
      await tx.wait(1);
      console.log(`✓ Minted on-chain in tx: ${tx.hash.substring(0, 14)}...`);
    } catch (err: any) {
      console.log(`Note (record may already exist): ${err.message || err}`);
    }
  }

  const count = await registry.getRecordCount();
  console.log(`==================================================`);
  console.log(`Total on-chain records count: ${count}`);
  console.log(`==================================================`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
