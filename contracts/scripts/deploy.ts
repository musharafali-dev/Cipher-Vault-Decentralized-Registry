import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("==================================================");
  console.log("Deploying DecentralizedRecordRegistry Contract...");
  console.log("==================================================");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH`);

  const registryFactory = await ethers.getContractFactory("DecentralizedRecordRegistry");
  const registry = await registryFactory.deploy();
  await registry.waitForDeployment();

  const deployedAddress = await registry.getAddress();
  console.log(`DecentralizedRecordRegistry successfully deployed to: ${deployedAddress}`);

  // Export contract address and ABI artifact for frontend & backend use
  const exportDir = path.join(__dirname, "../../shared");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const Artifact = require("../artifacts/contracts/DecentralizedRecordRegistry.sol/DecentralizedRecordRegistry.json");

  const deploymentConfig = {
    address: deployedAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    abi: Artifact.abi,
  };

  fs.writeFileSync(
    path.join(exportDir, "contract-config.json"),
    JSON.stringify(deploymentConfig, null, 2)
  );

  console.log(`Exported deployment details & ABI to: ${path.join(exportDir, "contract-config.json")}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error("Error during contract deployment:", error);
  process.exitCode = 1;
});
