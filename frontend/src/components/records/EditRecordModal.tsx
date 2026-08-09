"use client";

import { useState, useEffect } from "react";
import { getSignerContract, RecordItem } from "@/lib/contract";
import { useWalletStore } from "@/store/useWalletStore";
import { toast } from "sonner";
import { X, Edit, FileText, Hash, Tag, Loader2, Sparkles } from "lucide-react";

interface EditRecordModalProps {
  isOpen: boolean;
  record: RecordItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = ["General", "Medical", "Legal", "Financial", "Identity", "Property"];

export default function EditRecordModal({ isOpen, record, onClose, onSuccess }: EditRecordModalProps) {
  const { address, authToken } = useWalletStore();
  const [title, setTitle] = useState("");
  const [contentHash, setContentHash] = useState("");
  const [category, setCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setTitle(record.title);
      setContentHash(record.contentHash);
      setCategory(record.category || "General");
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !contentHash.trim()) {
      toast.error("Title and Content Hash cannot be empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const contract = await getSignerContract();
      toast.info("Please confirm update transaction in your wallet...");

      const tx = await contract.updateRecord(record.id, title.trim(), contentHash.trim(), category);
      toast.info(`Transaction submitted: ${tx.hash.substring(0, 10)}...`);

      await tx.wait(1);
      toast.success("Record updated successfully on blockchain!");

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
              onChainId: record.id,
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

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Update record error:", error);
      const errMsg = error?.reason || error?.message || "Failed to update record";
      toast.error(`Transaction Failed: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Edit className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Update Record Metadata</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {record.id.substring(0, 14)}...</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full glass-input text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-purple-400" />
              Content Hash / IPFS CID
            </label>
            <input
              type="text"
              value={contentHash}
              onChange={(e) => setContentHash(e.target.value)}
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

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
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
                  <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span>Update On-Chain</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
