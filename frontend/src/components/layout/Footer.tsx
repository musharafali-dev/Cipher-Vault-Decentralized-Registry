import Link from "next/link";
import { ShieldCheck, Github, ExternalLink, Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-darkBorder mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="flex flex-col gap-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5">
                <div className="w-full h-full bg-darkSurface rounded-[6px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-base text-slate-100">
                Cipher<span className="text-cyan-400">Vault</span> Registry
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Enterprise-grade decentralized record & metadata registry built with Solidity, OpenZeppelin, Hardhat, Express, Prisma, and Next.js 15.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit mt-1">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>Sepolia / Hardhat Network Active</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-cyan-400 transition">Home Overview</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition">Record Management</Link></li>
              <li><Link href="/transactions" className="hover:text-cyan-400 transition">Transaction Explorer</Link></li>
              <li><Link href="/about" className="hover:text-cyan-400 transition">Architecture & Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Smart Contract</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-1">
                <span>Standard: ERC-OpenZeppelin</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Security: ReentrancyGuard</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Access: Ownable 5.0</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CipherVault dApp. Production Ready Web3 Architecture.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition cursor-pointer">Security Audit</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
