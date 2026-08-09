import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sample Web3 Decentralized Records and User Profiles...");

  // 1. Create Users
  const user1 = await prisma.user.upsert({
    where: { address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8" },
    update: {},
    create: {
      address: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      nonce: "Sign this message to authenticate with Decentralized Record Registry: 482910481-1723245600000",
      name: "Satoshi Nakamoto",
      email: "satoshi@cipher-vault.io",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      bio: "Lead Security Auditor & Blockchain Architect.",
      role: "ADMIN",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { address: "0x3c44cdd06a900c21d014701167af79987502474e" },
    update: {},
    create: {
      address: "0x3c44cdd06a900c21d014701167af79987502474e",
      nonce: "Sign this message to authenticate with Decentralized Record Registry: 981240182-1723245600000",
      name: "Elena Rostova",
      email: "elena@cipher-vault.io",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Legal Tech Researcher & Smart Contract Specialist.",
      role: "USER",
    },
  });

  // 2. Sample Records Data
  const recordsData = [
    {
      onChainId: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      ownerAddress: user1.address,
      title: "Commercial Real Estate Land Title Deed #4092",
      contentHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      category: "Property",
      isActive: true,
    },
    {
      onChainId: "0x4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      ownerAddress: user1.address,
      title: "Genomic Sequencing & Clinical Trial Record #802",
      contentHash: "QmPZ9gcCEpqKTo6aq61g2nXGUhM4MCL3fKmC282W2vD5am",
      category: "Medical",
      isActive: true,
    },
    {
      onChainId: "0xef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
      ownerAddress: user2.address,
      title: "Enterprise Software Patent & IP Licensing Rights",
      contentHash: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
      category: "Legal",
      isActive: true,
    },
    {
      onChainId: "0x8f2d4e1a3b5c7f9e8d2a4b6c8e0f1a3b5c7f9e8d2a4b6c8e0f1a3b5c7f9e8d2a",
      ownerAddress: user2.address,
      title: "Quarterly Financial Escrow Audit & Treasury Report 2026",
      contentHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      category: "Financial",
      isActive: true,
    },
    {
      onChainId: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      ownerAddress: user1.address,
      title: "Self-Sovereign Decentralized Identity Credential (DID)",
      contentHash: "QmNLei78zWmRYZCCNxPA6CeTc22yVJ55vaq548vG2a1y",
      category: "Identity",
      isActive: true,
    },
    {
      onChainId: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e",
      ownerAddress: user2.address,
      title: "Cross-Border International Supply Chain Custody Manifest",
      contentHash: "QmZTM4a41F2LgXk7wM435555m3P33342345511345Aa",
      category: "General",
      isActive: true,
    },
  ];

  for (const rec of recordsData) {
    await prisma.recordCache.upsert({
      where: { onChainId: rec.onChainId },
      update: rec,
      create: rec,
    });
  }

  // 3. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { userId: user1.id, action: "SEED_DATA_MINT", details: "Seeded initial decentralized property title record." },
      { userId: user2.id, action: "SEED_DATA_MINT", details: "Seeded initial patent IP licensing agreement." },
    ],
  });

  console.log("Successfully seeded 6 decentralized records, 2 user profiles, and audit logs!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
