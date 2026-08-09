"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Sliders, Cpu, Server, Shield, RefreshCw } from "lucide-react";
import { DEFAULT_CONTRACT_ADDRESS } from "@/lib/contract";
import { toast } from "sonner";

export default function Settings() {
  const [contractAddress, setContractAddress] = useState(DEFAULT_CONTRACT_ADDRESS);
  const [rpcUrl, setRpcUrl] = useState(process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545");
  const [network, setNetwork] = useState("Localhost / Sepolia");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings updated successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="pb-8 mb-8 border-b border-darkBorder">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-purple-400" />
          <span>System & Network Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure RPC connections, contract deployment targets, and client state.
        </p>
      </div>

      <div className="space-y-6">
        {/* Network & RPC Config */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Blockchain Network & Provider</h3>
              <p className="text-xs text-slate-400">Manage EVM endpoint nodes</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Active Network Environment
              </label>
              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full glass-input text-sm bg-darkSurface text-slate-200"
              >
                <option value="Localhost / Sepolia">Hardhat Localhost (Chain ID: 31337)</option>
                <option value="Sepolia Testnet">Ethereum Sepolia Testnet (Chain ID: 11155111)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                JSON-RPC Endpoint URL
              </label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                className="w-full glass-input text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Registry Smart Contract Address
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="w-full glass-input text-sm font-mono text-cyan-300"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="glass-button text-xs font-semibold px-5 py-2">
                Save Configurations
              </button>
            </div>
          </form>
        </div>

        {/* Backend API Configuration */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Express API Indexer Endpoint</h3>
              <p className="text-xs text-slate-400">Node.js + Prisma ORM REST Backend</p>
            </div>
          </div>

          <div className="p-3 bg-darkBg border border-white/5 rounded-xl text-xs font-mono text-slate-300">
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}
          </div>
        </div>
      </div>
    </div>
  );
}
