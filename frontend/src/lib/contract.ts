import { ethers } from "ethers";

// Default contract config fallback
export const DEFAULT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  "function createRecord(bytes32 id, string title, string contentHash, string category) external",
  "function updateRecord(bytes32 id, string title, string contentHash, string category) external",
  "function deleteRecord(bytes32 id) external",
  "function getRecord(bytes32 id) external view returns (tuple(bytes32 id, address owner, string title, string contentHash, string category, uint256 createdAt, uint256 updatedAt, bool isActive))",
  "function getUserRecords(address user) external view returns (bytes32[])",
  "function getUserRecordsDetailed(address user) external view returns (tuple(bytes32 id, address owner, string title, string contentHash, string category, uint256 createdAt, uint256 updatedAt, bool isActive)[])",
  "function getAllRecords() external view returns (tuple(bytes32 id, address owner, string title, string contentHash, string category, uint256 createdAt, uint256 updatedAt, bool isActive)[])",
  "function getRecordCount() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function transferOwnership(address newOwner) external",
  "event RecordCreated(bytes32 indexed id, address indexed owner, string title, string category, uint256 timestamp)",
  "event RecordUpdated(bytes32 indexed id, address indexed owner, string title, string category, uint256 timestamp)",
  "event RecordDeleted(bytes32 indexed id, address indexed owner, uint256 timestamp)"
];

export interface RecordItem {
  id: string; // bytes32 hex string
  owner: string;
  title: string;
  contentHash: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545");
}

export async function getSignerContract(contractAddress: string = DEFAULT_CONTRACT_ADDRESS) {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("No wallet provider detected.");
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
}

export async function getReadOnlyContract(contractAddress: string = DEFAULT_CONTRACT_ADDRESS) {
  const provider = getProvider();
  return new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
}

export function generateRecordId(title: string, category: string): string {
  const randomSalt = Math.floor(Math.random() * 1000000000).toString();
  return ethers.keccak256(ethers.toUtf8Bytes(`${title}-${category}-${Date.now()}-${randomSalt}`));
}
