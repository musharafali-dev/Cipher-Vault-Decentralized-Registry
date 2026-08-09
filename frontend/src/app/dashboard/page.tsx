"use client";

import { useState, useEffect, useCallback } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import { getReadOnlyContract, RecordItem, DEFAULT_CONTRACT_ADDRESS } from "@/lib/contract";
import CreateRecordModal from "@/components/records/CreateRecordModal";
import EditRecordModal from "@/components/records/EditRecordModal";
import DeleteRecordModal from "@/components/records/DeleteRecordModal";
import { toast } from "sonner";
import {
  Database,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Copy,
  Edit,
  Trash2,
  Wallet,
  Loader2,
  FileCode,
  Check,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export default function Dashboard() {
  const { address, isConnected, balance, connect, refreshBalance } = useWalletStore();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEditRecord, setSelectedEditRecord] = useState<RecordItem | null>(null);
  const [selectedDeleteRecord, setSelectedDeleteRecord] = useState<RecordItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const contract = await getReadOnlyContract();
      const rawRecords = await contract.getAllRecords();

      const formatted: RecordItem[] = rawRecords.map((r: any) => ({
        id: r.id,
        owner: r.owner,
        title: r.title,
        contentHash: r.contentHash,
        category: r.category || "General",
        createdAt: Number(r.createdAt) * 1000,
        updatedAt: Number(r.updatedAt) * 1000,
        isActive: r.isActive,
      }));

      setRecords(formatted);
      await refreshBalance();
    } catch (error: any) {
      console.error("Fetch records error:", error);
      toast.error("Failed to fetch on-chain records from contract.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshBalance]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Search & Filter Effect
  useEffect(() => {
    let result = records.filter((r) => r.isActive);

    if (selectedCategory !== "All") {
      result = result.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.contentHash.toLowerCase().includes(q) ||
          r.owner.toLowerCase().includes(q)
      );
    }

    setFilteredRecords(result);
  }, [records, searchQuery, selectedCategory]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("IPFS hash copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ["All", "General", "Medical", "Legal", "Financial", "Identity", "Property"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-grid-pattern">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-white/10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 flex items-center gap-3">
            <Database className="w-8 h-8 text-cyan-400" />
            <span>Decentralized Record Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your immutable Solidity smart contract entries and IPFS hashes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecords}
            disabled={isLoading}
            className="p-3 rounded-2xl morphic-card hover:border-cyan-500/40 text-slate-300 hover:text-white transition"
            title="Refresh On-Chain State"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          {isConnected ? (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="morphic-button-primary text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Mint On-Chain Record</span>
            </button>
          ) : (
            <button
              onClick={connect}
              className="morphic-button-primary text-sm"
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet to Mint</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="morphic-card-hover rounded-3xl p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Wallet</p>
          <p className="text-sm font-mono font-bold text-cyan-300 mt-1.5 truncate">
            {address ? address : "Not Connected"}
          </p>
        </div>

        <div className="morphic-card-hover rounded-3xl p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Wallet Balance</p>
          <p className="text-xl font-mono font-bold text-purple-400 mt-1">
            {balance ? `${balance} ETH` : "0.00 ETH"}
          </p>
        </div>

        <div className="morphic-card-hover rounded-3xl p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active On-Chain Records</p>
          <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">
            {records.filter((r) => r.isActive).length}
          </p>
        </div>

        <div className="morphic-card-hover rounded-3xl p-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Registry Contract</p>
          <p className="text-xs font-mono text-slate-300 mt-2 truncate" title={DEFAULT_CONTRACT_ADDRESS}>
            {DEFAULT_CONTRACT_ADDRESS.substring(0, 12)}...{DEFAULT_CONTRACT_ADDRESS.substring(DEFAULT_CONTRACT_ADDRESS.length - 4)}
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="morphic-card rounded-3xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, IPFS CID, or owner address..."
            className="w-full glass-input pl-11 text-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedCategory === cat
                  ? "badge-neon-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Record Cards */}
      {isLoading ? (
        <div className="morphic-card rounded-3xl p-16 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
          <p className="text-base text-slate-200 font-semibold">Fetching smart contract state from blockchain...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="morphic-card rounded-3xl p-16 text-center flex flex-col items-center justify-center">
          <FileCode className="w-14 h-14 text-slate-500 mb-4" />
          <h3 className="text-xl font-bold text-slate-200">No Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">
            {searchQuery || selectedCategory !== "All"
              ? "No records match your active search filter."
              : "Mint your first decentralized record entry on the smart contract."}
          </p>
          {isConnected && (
            <button onClick={() => setIsCreateOpen(true)} className="morphic-button-primary text-xs px-5 py-2.5">
              Mint First Record
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => {
            const isOwner = address && address.toLowerCase() === record.owner.toLowerCase();

            return (
              <div key={record.id} className="morphic-card-hover rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold badge-neon-purple flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      {record.category}
                    </span>
                    {isOwner ? (
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono badge-neon-emerald font-bold">
                        Owner
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-white/5 text-slate-400">
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-lg text-slate-100 mb-3 leading-snug line-clamp-2">
                    {record.title}
                  </h3>

                  {/* IPFS CID Box */}
                  <div className="p-3 bg-darkBg/90 rounded-2xl border border-white/5 mb-5 shadow-inner">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">IPFS Content Hash / CID</p>
                    <div className="flex items-center justify-between gap-2 font-mono text-xs text-cyan-300">
                      <span className="truncate">{record.contentHash}</span>
                      <button
                        onClick={() => copyToClipboard(record.contentHash, record.id)}
                        className="p-1.5 hover:text-white text-slate-400 transition hover:bg-white/10 rounded-lg"
                        title="Copy Hash"
                      >
                        {copiedId === record.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Meta & Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono">{new Date(record.createdAt).toLocaleDateString()}</span>

                  {isOwner && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedEditRecord(record)}
                        className="p-2 hover:bg-purple-500/20 hover:text-purple-300 rounded-xl transition border border-transparent hover:border-purple-500/30"
                        title="Edit Record"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedDeleteRecord(record)}
                        className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition border border-transparent hover:border-rose-500/30"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateRecordModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchRecords}
      />

      <EditRecordModal
        isOpen={!!selectedEditRecord}
        record={selectedEditRecord}
        onClose={() => setSelectedEditRecord(null)}
        onSuccess={fetchRecords}
      />

      <DeleteRecordModal
        isOpen={!!selectedDeleteRecord}
        record={selectedDeleteRecord}
        onClose={() => setSelectedDeleteRecord(null)}
        onSuccess={fetchRecords}
      />
    </div>
  );
}
