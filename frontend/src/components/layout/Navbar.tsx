"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWalletStore } from "@/store/useWalletStore";
import { Wallet, ShieldCheck, ChevronRight, LogOut, Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Navbar() {
  const pathname = usePathname();
  const { address, balance, chainId, isConnected, isConnecting, connect, disconnect, userProfile } = useWalletStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Transactions", href: "/transactions" },
    { name: "Profile", href: "/profile" },
    { name: "Settings", href: "/settings" },
    { name: "About", href: "/about" },
  ];

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Wallet address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getNetworkName = (id: number | null) => {
    if (!id) return "Localhost / Sepolia";
    if (id === 11155111) return "Sepolia Testnet";
    if (id === 1) return "Ethereum Mainnet";
    if (id === 31337) return "Hardhat Local";
    return `Chain ID: ${id}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      {/* Top glowing ambient line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-purple-500 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-0.5 shadow-glowCyan group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full bg-darkSurface rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-slate-100 tracking-tight flex items-center gap-1.5 font-sans">
              Cipher<span className="text-transparent bg-clip-text bg-accent-gradient">Vault</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Decentralized Registry
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-darkSurface/90 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-glowCyan"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Wallet Connection / Profile */}
        <div className="flex items-center gap-3">
          {isConnected && address ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 morphic-card px-4 py-2 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/70 transition-all duration-300 shadow-glowCyan"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
                  <span className="font-mono text-xs text-slate-300 hidden sm:inline font-semibold">
                    {balance ? `${balance} ETH` : "0 ETH"}
                  </span>
                </div>

                <div className="h-4 w-px bg-white/15 hidden sm:block" />

                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-300">
                  <span>{userProfile?.name || formatAddress(address)}</span>
                  <button onClick={copyAddress} className="p-1 hover:text-white text-slate-400 transition" title="Copy Address">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 morphic-card rounded-3xl p-3 shadow-2xl border border-white/15 flex flex-col gap-1 z-50 animate-fadeIn">
                  <div className="p-3.5 border-b border-white/10 bg-darkBg/60 rounded-2xl mb-1">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Connected Network</p>
                    <p className="font-mono text-xs text-emerald-400 font-bold mt-0.5">{getNetworkName(chainId)}</p>
                    
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mt-2.5">Wallet Address</p>
                    <p className="font-mono text-xs text-cyan-300 font-semibold break-all mt-0.5">{address}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl text-xs text-slate-200 font-semibold transition"
                  >
                    <span>User Profile Settings</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <button
                    onClick={() => {
                      disconnect();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center justify-between p-3 hover:bg-rose-500/10 text-rose-400 rounded-2xl text-xs font-bold transition"
                  >
                    <span>Disconnect Wallet</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="morphic-button-primary"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-white" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
