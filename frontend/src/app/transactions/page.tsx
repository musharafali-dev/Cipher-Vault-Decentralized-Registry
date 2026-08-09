"use client";

import { useState } from "react";
import { Activity, ExternalLink, CheckCircle2, ArrowUpRight, ShieldCheck, Filter } from "lucide-react";
import { DEFAULT_CONTRACT_ADDRESS } from "@/lib/contract";

interface TransactionLog {
  id: string;
  txHash: string;
  type: "CREATE_RECORD" | "UPDATE_RECORD" | "DELETE_RECORD" | "SIGN_IN";
  status: "CONFIRMED" | "PENDING";
  timestamp: string;
  blockNumber: number;
  gasUsed: string;
}

export default function Transactions() {
  const [filterType, setFilterType] = useState<string>("ALL");

  // Sample production-quality indexed transaction feed
  const mockTransactions: TransactionLog[] = [
    {
      id: "tx-001",
      txHash: "0x8f2d4e1a3b5c7f9e8d2a4b6c8e0f1a3b5c7f9e8d2a4b6c8e0f1a3b5c7f9e8d2a",
      type: "CREATE_RECORD",
      status: "CONFIRMED",
      timestamp: new Date(Date.now() - 3600000).toLocaleString(),
      blockNumber: 5892401,
      gasUsed: "0.0024 ETH",
    },
    {
      id: "tx-002",
      txHash: "0x3a5b7c9e1f2d4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4a6b8c0e2f4a",
      type: "SIGN_IN",
      status: "CONFIRMED",
      timestamp: new Date(Date.now() - 7200000).toLocaleString(),
      blockNumber: 5892350,
      gasUsed: "0.0000 ETH (SIWE)",
    },
    {
      id: "tx-003",
      txHash: "0x7e9f1a3b5c7d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8e0f2a",
      type: "UPDATE_RECORD",
      status: "CONFIRMED",
      timestamp: new Date(Date.now() - 14400000).toLocaleString(),
      blockNumber: 5892210,
      gasUsed: "0.0018 ETH",
    },
  ];

  const filteredLogs = filterType === "ALL" 
    ? mockTransactions 
    : mockTransactions.filter(t => t.type === filterType);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-darkBorder">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-purple-400" />
            <span>On-Chain Transaction Explorer</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time audit log of smart contract state changes and Web3 authentication events.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {["ALL", "CREATE_RECORD", "UPDATE_RECORD", "DELETE_RECORD", "SIGN_IN"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition ${
                filterType === type
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-darkSurface/90 border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="px-6 py-4">Transaction Hash</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Block #</th>
                <th className="px-6 py-4">Gas Fee</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
              {filteredLogs.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 font-semibold text-cyan-400">
                    {tx.txHash.substring(0, 14)}...{tx.txHash.substring(tx.txHash.length - 8)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{tx.blockNumber}</td>
                  <td className="px-6 py-4 text-slate-400">{tx.gasUsed}</td>
                  <td className="px-6 py-4 text-slate-400 font-sans">{tx.timestamp}</td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-sans text-xs"
                    >
                      <span>Etherscan</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
