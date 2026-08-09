import { ShieldCheck, Code2, Layers, Cpu, CheckCircle2, Lock, Terminal } from "lucide-react";

export default function About() {
  const specs = [
    { label: "Solidity Compiler", detail: "v0.8.24 (Paris EVM Target, Optimizer Runs: 200)" },
    { label: "Security Libraries", detail: "OpenZeppelin Contracts v5.0.2 (Ownable, ReentrancyGuard)" },
    { label: "EVM Interface Library", detail: "Ethers.js v6.13.2" },
    { label: "Backend API Framework", detail: "Express.js 4.19 + TypeScript 5.5 + Prisma ORM 5.18" },
    { label: "Frontend Stack", detail: "Next.js 15 App Router + React 19 + Tailwind CSS + Framer Motion" },
    { label: "State Management", detail: "Zustand 4.5 + Persistent Storage Middleware" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="pb-8 mb-8 border-b border-darkBorder text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center justify-center sm:justify-start gap-2.5">
          <ShieldCheck className="w-7 h-7 text-cyan-400" />
          <span>Architecture & Security Audit Specs</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Technical specifications for the Decentralized Record Registry Web3 application.
        </p>
      </div>

      <div className="space-y-8">
        {/* Clean Architecture Section */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Layered Clean Architecture</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
            The project decouples smart contract storage, off-chain event indexing, and user interactions into three distinct layers to ensure zero tight coupling and maximum scalability.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-darkBg/90 border border-white/5 rounded-2xl">
              <h3 className="font-bold text-xs text-cyan-400 uppercase tracking-wider mb-2">1. On-Chain Storage</h3>
              <p className="text-xs text-slate-400 leading-normal">
                `DecentralizedRecordRegistry.sol` guarantees data immutability, ownership checks, and event logs.
              </p>
            </div>

            <div className="p-4 bg-darkBg/90 border border-white/5 rounded-2xl">
              <h3 className="font-bold text-xs text-purple-400 uppercase tracking-wider mb-2">2. Express & Prisma Indexer</h3>
              <p className="text-xs text-slate-400 leading-normal">
                REST API caches contract metadata and validates Ethers wallet signatures for off-chain user profiles.
              </p>
            </div>

            <div className="p-4 bg-darkBg/90 border border-white/5 rounded-2xl">
              <h3 className="font-bold text-xs text-emerald-400 uppercase tracking-wider mb-2">3. Next.js 15 UI</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Glassmorphic responsive interface connected via Ethers.js v6 and Zustand store.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Specs List */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>System Specifications</span>
          </h2>

          <div className="space-y-3 font-mono text-xs">
            {specs.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-darkBg/60 border border-white/5 rounded-xl gap-1">
                <span className="text-slate-400 font-sans">{item.label}:</span>
                <span className="text-cyan-300 font-semibold">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
