"use client";

import Link from "next/link";
import { useWalletStore } from "@/store/useWalletStore";
import { ShieldCheck, Database, Lock, Cpu, ArrowRight, Sparkles, Layers, CheckCircle2, Terminal, Code2 } from "lucide-react";

export default function Home() {
  const { isConnected, connect } = useWalletStore();

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />,
      badge: "OpenZeppelin 5.0",
      title: "Immutable Solidity Registry",
      description: "Smart contracts fortified with OpenZeppelin Ownable 5.0 and ReentrancyGuard for complete data integrity.",
    },
    {
      icon: <Lock className="w-6 h-6 text-purple-400" />,
      badge: "Ethers.js v6 SIWE",
      title: "Wallet Signature Auth (SIWE)",
      description: "Cryptographically authenticates users using Ethers.js v6 message signatures without centralized passwords.",
    },
    {
      icon: <Database className="w-6 h-6 text-emerald-400" />,
      badge: "Prisma ORM Caching",
      title: "Hybrid On-Chain & Indexer",
      description: "Blazing fast queries backed by Express API & Prisma ORM auto-synced with raw smart contract events.",
    },
    {
      icon: <Cpu className="w-6 h-6 text-blue-400" />,
      badge: "Solidity 0.8.24",
      title: "Gas-Optimized Smart Contract",
      description: "Built with custom Solidity errors, calldata layout, and tight struct packing for minimal gas fees.",
    },
  ];

  const metrics = [
    { label: "Security Audit Status", value: "Verified Ready", badgeClass: "badge-neon-emerald" },
    { label: "Solidity Compiler", value: "v0.8.24", badgeClass: "badge-neon-cyan" },
    { label: "Access Control", value: "Ownable 5.0", badgeClass: "badge-neon-purple" },
    { label: "Network Compatibility", value: "Sepolia / Local", badgeClass: "badge-neon-cyan" },
  ];

  return (
    <div className="relative overflow-hidden pt-8 pb-24 bg-grid-pattern">
      {/* Background Animated Neon Spheres */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-purple-500/15 to-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-5 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto pt-10 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full morphic-card text-cyan-300 text-xs font-mono mb-8 border border-cyan-500/30 shadow-glowCyan animate-fadeIn">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Enterprise Web3 Record & Asset Registry Engine</span>
          </div>

          <h1 className="text-4xl sm:text-7xl font-extrabold text-slate-100 tracking-tight leading-[1.15]">
            Decentralized Record <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-500">
              Registry & Verification
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Store, manage, and verify critical metadata and IPFS content hashes on the blockchain with zero central authority. Fortified with OpenZeppelin, Hardhat, Express, Prisma, and Next.js 14.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="morphic-button-primary text-base px-8 py-3.5 rounded-2xl w-full sm:w-auto"
            >
              <span>Launch dApp Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            {!isConnected && (
              <button
                onClick={connect}
                className="morphic-button-secondary text-base px-8 py-3.5 rounded-2xl w-full sm:w-auto"
              >
                <span>Connect MetaMask</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-20">
          {metrics.map((m, idx) => (
            <div key={idx} className="morphic-card-hover rounded-3xl p-6 text-center">
              <span className="block text-xl sm:text-2xl font-extrabold font-mono text-cyan-300 mb-1">{m.value}</span>
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-20">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100">Production Web3 Architecture</h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">Designed following Clean Architecture, SOLID principles, and strict TypeScript definitions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat, idx) => (
              <div key={idx} className="morphic-card-hover rounded-3xl p-7 sm:p-8 flex items-start gap-6">
                <div className="p-3.5 bg-darkBg/90 rounded-2xl border border-white/10 shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md badge-neon-cyan">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Banner */}
        <div className="morphic-card rounded-3xl p-8 border border-white/15 bg-gradient-to-r from-darkSurface/90 via-darkBg/90 to-darkSurface/90 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Layers className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-100">Solidity Hardhat + Express Prisma + Next.js 14</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Full stack Web3 codebase ready for Sepolia Testnet deployment.</p>
            </div>
          </div>

          <Link href="/about" className="morphic-button-secondary text-xs font-semibold px-6 py-3">
            View Architecture Specs
          </Link>
        </div>
      </div>
    </div>
  );
}
