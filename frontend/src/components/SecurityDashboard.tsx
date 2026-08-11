"use client";

import { useState } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Activity,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Zap,
  UserCheck,
  Terminal,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { isValidIPFSHash, sanitizeInput } from "@/lib/sanitizer";
import { toast } from "sonner";

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  ipAddress: string;
  riskLevel: "INFO" | "WARN" | "CRITICAL";
}

export default function SecurityDashboard() {
  const { isConnected, address, userProfile, chainId } = useWalletStore();
  const [testInput, setTestInput] = useState("");
  const [sanitizedResult, setSanitizedResult] = useState("");
  const [cidInput, setCidInput] = useState("QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco");
  const [cidValid, setCidValid] = useState<boolean | null>(true);

  // Mock Audit Log Feed representing live SecOps data
  const [auditLogs] = useState<AuditEntry[]>([
    {
      id: "log-101",
      timestamp: "2026-08-11 22:15:02",
      action: "WALLET_SIGN_IN",
      details: "EIP-4361 SIWE signature verified successfully for session token",
      ipAddress: "192.168.1.104",
      riskLevel: "INFO",
    },
    {
      id: "log-102",
      timestamp: "2026-08-11 21:48:30",
      action: "CIRCUIT_BREAKER_CHECK",
      details: "DecentralizedRecordRegistry contract state verified: NORMAL (UNPAUSED)",
      ipAddress: "System",
      riskLevel: "INFO",
    },
    {
      id: "log-103",
      timestamp: "2026-08-11 20:12:11",
      action: "RATE_LIMIT_PREVENTED",
      details: "Rate limiter throttled 5 excessive nonce generation requests from 45.142.120.4",
      ipAddress: "45.142.120.4",
      riskLevel: "WARN",
    },
    {
      id: "log-104",
      timestamp: "2026-08-11 18:30:54",
      action: "PAYLOAD_XSS_STRIPPED",
      details: "Sanitized suspicious script tag payload in record title submission",
      ipAddress: "185.220.101.5",
      riskLevel: "WARN",
    },
    {
      id: "log-105",
      timestamp: "2026-08-11 15:04:19",
      action: "ROLE_GRANT_EVENT",
      details: "Granted SECURITY_ADMIN_ROLE to deployer wallet 0x7099...79C8",
      ipAddress: "On-Chain",
      riskLevel: "INFO",
    },
  ]);

  const handleTestSanitize = () => {
    const clean = sanitizeInput(testInput);
    setSanitizedResult(clean);
    toast.info("Input sanitized against script injection & HTML tags!");
  };

  const handleValidateCID = (val: string) => {
    setCidInput(val);
    setCidValid(isValidIPFSHash(val));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="vault-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-br from-darkSurface via-darkBg to-amber-950/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SecOps Shield Active
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              Security & Audit <span className="text-amber-400">Operations Center</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Real-time monitoring for Smart Contract Pausable circuit breakers, SIWE EIP-4361 authentication session security, and cryptographic input boundaries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="vault-card px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Contract Health</p>
                <p className="text-sm font-bold text-white">0 Vulnerabilities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: SIWE Auth Security */}
        <div className="vault-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Key className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              EIP-4361 Active
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white font-heading">SIWE Wallet Security</h3>
            <p className="text-xs text-slate-400 mt-1">5-minute Nonce TTL window & anti-replay protection enabled.</p>
          </div>

          <div className="pt-3 border-t border-white/10 font-mono text-xs text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Connected Wallet:</span>
              <span className="text-amber-300 font-semibold">{address ? `${address.substring(0, 8)}...` : "Not Connected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Chain ID:</span>
              <span className="text-slate-200">{chainId || "31337 / Sepolia"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Smart Contract Circuit Breaker */}
        <div className="vault-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              Circuit Breaker Ready
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white font-heading">Smart Contract Pausable</h3>
            <p className="text-xs text-slate-400 mt-1">OpenZeppelin Pausable contract with SECURITY_ADMIN_ROLE control.</p>
          </div>

          <div className="pt-3 border-t border-white/10 font-mono text-xs text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Contract State:</span>
              <span className="text-emerald-400 font-bold">NORMAL (UNPAUSED)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cooldown Guard:</span>
              <span className="text-slate-200">3 sec / tx</span>
            </div>
          </div>
        </div>

        {/* Card 3: Input Boundary Defense */}
        <div className="vault-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-blue-400 font-bold px-2.5 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
              DoS Shield Active
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white font-heading">Input Length & Gas Bounds</h3>
            <p className="text-xs text-slate-400 mt-1">Prevents gas exhaustion attacks via strict length caps on-chain.</p>
          </div>

          <div className="pt-3 border-t border-white/10 font-mono text-xs text-slate-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Max Title Limit:</span>
              <span className="text-slate-200">128 bytes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Max CID Limit:</span>
              <span className="text-slate-200">256 bytes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Cryptographic & Input Sanitizer Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Widget 1: XSS Sanitizer Tester */}
        <div className="vault-card rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white font-heading">XSS Payload Sanitizer Tester</h3>
          </div>
          <p className="text-xs text-slate-400">
            Test how the backend and client-side sanitizers strip malicious script tags and HTML injection payloads.
          </p>

          <div className="space-y-3 pt-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="e.g. Patient Record <script>alert('xss')</script>"
              className="w-full px-4 py-3 rounded-2xl bg-darkBg border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
            />

            <button
              onClick={handleTestSanitize}
              className="vault-button-gold text-xs w-full py-2.5"
            >
              Sanitize Payload
            </button>

            {sanitizedResult !== "" && (
              <div className="p-3 rounded-2xl bg-darkBg/80 border border-emerald-500/30 text-xs font-mono space-y-1">
                <p className="text-slate-500 text-[10px] uppercase">Sanitized Output:</p>
                <p className="text-emerald-400 font-semibold">{sanitizedResult || "(empty payload)"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Widget 2: IPFS CID Format Validator */}
        <div className="vault-card rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white font-heading">IPFS Cryptographic CID Inspector</h3>
          </div>
          <p className="text-xs text-slate-400">
            Validates IPFS CID v0 (Qm...), CID v1 (bafy...), or SHA-256 hex hashes before on-chain indexing.
          </p>

          <div className="space-y-3 pt-2">
            <div className="relative">
              <input
                type="text"
                value={cidInput}
                onChange={(e) => handleValidateCID(e.target.value)}
                placeholder="Enter IPFS CID (e.g. QmXoyp...)"
                className="w-full px-4 py-3 rounded-2xl bg-darkBg border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
              />
              <div className="absolute right-3 top-3">
                {cidValid === true && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {cidValid === false && <XCircle className="w-5 h-5 text-rose-400" />}
              </div>
            </div>

            <div className={`p-3 rounded-2xl border text-xs font-mono ${cidValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
              <p className="font-semibold">
                Status: {cidValid ? "Valid Cryptographic Content Hash Format" : "Invalid Hash Format"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Log Stream */}
      <div className="vault-card rounded-3xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-xl font-bold text-white font-heading">Live SecOps Audit Trail</h3>
              <p className="text-xs text-slate-400">Automated event auditing for authentication attempts and policy triggers.</p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            Live Sync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">Action Triggered</th>
                <th className="pb-3 px-3">Details / Target</th>
                <th className="pb-3 px-3">IP Address</th>
                <th className="pb-3 px-3 text-right">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-3 font-bold text-amber-300 whitespace-nowrap">{log.action}</td>
                  <td className="py-3 px-3 text-slate-300 max-w-md truncate">{log.details}</td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{log.ipAddress}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.riskLevel === "INFO"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : log.riskLevel === "WARN"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {log.riskLevel}
                    </span>
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
