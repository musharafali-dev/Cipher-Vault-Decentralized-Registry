"use client";

import { useState } from "react";
import { getSignerContract, RecordItem } from "@/lib/contract";
import { useWalletStore } from "@/store/useWalletStore";
import { toast } from "sonner";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteRecordModalProps {
  isOpen: boolean;
  record: RecordItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteRecordModal({ isOpen, record, onClose, onSuccess }: DeleteRecordModalProps) {
  const { address, authToken } = useWalletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !record) return null;

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      const contract = await getSignerContract();
      toast.info("Please confirm deletion transaction in your wallet...");

      const tx = await contract.deleteRecord(record.id);
      toast.info(`Transaction submitted: ${tx.hash.substring(0, 10)}...`);

      await tx.wait(1);
      toast.success("Record soft-deleted on blockchain!");

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
              ownerAddress: record.owner,
              title: record.title,
              contentHash: record.contentHash,
              category: record.category,
              isActive: false,
            }),
          });
        } catch (syncErr) {
          console.warn("Backend sync notification deferred:", syncErr);
        }
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Delete record error:", error);
      const errMsg = error?.reason || error?.message || "Failed to delete record";
      toast.error(`Transaction Failed: ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-500/20">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">Delete Record</h3>
              <p className="text-xs text-rose-400">Irreversible Smart Contract Call</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300 mb-2">
          Are you sure you want to mark this record as inactive on-chain?
        </p>
        <div className="p-3 bg-darkBg/80 border border-white/5 rounded-xl text-xs space-y-1 mb-6 font-mono">
          <p className="text-slate-400">Title: <span className="text-slate-200">{record.title}</span></p>
          <p className="text-slate-400">ID: <span className="text-cyan-400">{record.id.substring(0, 18)}...</span></p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition shadow-lg shadow-rose-600/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
