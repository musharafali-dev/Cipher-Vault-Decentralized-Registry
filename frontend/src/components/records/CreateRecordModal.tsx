"use client";

import { useState } from "react";
import { getSignerContract, generateRecordId } from "@/lib/contract";
import { useWalletStore } from "@/store/useWalletStore";
import { toast } from "sonner";
import { X, Plus, Sparkles, Database, FileText, Tag, Hash, Loader2 } from "lucide-react";

interface CreateRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ["General", "Medical", "Legal", "Financial", "Identity", "Property"];

export default function CreateRecordModal({ isOpen, onClose, onSuccess }: CreateRecordModalProps) {
  const { address, authToken } = useWalletStore();
  const [title, setTitle] = useState("");
  const [contentHash, setContentHash] = useState("");
  const [category, setCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a record title.");
      return;
    }

    if (!contentHash.trim()) {
      toast.error("Please enter an IPFS CID or cryptographic hash.");
      return;
    }

    if (!address) {
      toast.error("Please connect your wallet first.");
      return;
    }

    setIsSubmitting(true);
    setTxHash(null);

    try {
      const contract = await getSignerContract();
      const newId = generateRecordId(title, category);

      toast.info("Please confirm transaction in your wallet...");
      const tx = await contract.createRecord(newId, title.trim(), contentHash.trim(), category);
      
      setTxHash(tx.hash);
      toast.info(`Transaction submitted: ${tx.hash.substring(0, 10)}... Waiting for block confirmation.`);

      await tx.wait(1);
      toast.success("Record created successfully on blockchain!");

      // Sync with Express backend API if authenticated
      if (authToken) {
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
          await fetch(`${API_BASE}/records/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              onChainId: newId,
              ownerAddress: address,
              title: title.trim(),
              contentHash: contentHash.trim(),
              category,
              isActive: true,
            }),
          });
        } catch (syncErr) {
          console.warn("Backend sync notification deferred:", syncErr);
        }
      }

      setTitle("");
      setContentHash("");
      setCategory("General");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Create record error:", error);
      const errMsg = error?.reason || error?.message || "Failed to create on-chain record";
      toast.error(`Transaction Failed: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Plus className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Create Decentralized Record</h3>
              <p className="text-xs text-slate-400">Mint an immutable on-chain record entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Record Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Legal Deed / Medical Result #402"
              disabled={isSubmitting}
              className="w-full glass-input text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-purple-400" />
              IPFS Content Hash / CID
            </label>
            <input
              type="text"
              value={contentHash}
              onChange={(e) => setContentHash(e.target.value)}
              placeholder="e.g. QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
              disabled={isSubmitting}
              className="w-full glass-input text-sm font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              className="w-full glass-input text-sm bg-darkSurface text-slate-200"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-darkBg text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {txHash && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 font-mono break-all">
              <span className="font-sans text-slate-400">Tx Hash: </span>
              {txHash}
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-button flex items-center gap-2 text-sm font-semibold text-white min-w-[140px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Mint Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
