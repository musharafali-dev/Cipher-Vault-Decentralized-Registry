"use client";

import { useState, useEffect } from "react";
import { useWalletStore } from "@/store/useWalletStore";
import { toast } from "sonner";
import { User, Mail, Image as ImageIcon, FileText, Wallet, ShieldCheck, LogOut, Loader2, Save } from "lucide-react";

export default function Profile() {
  const { address, balance, isConnected, authToken, userProfile, updateProfileState, connect, disconnect } = useWalletStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setEmail(userProfile.email || "");
      setAvatar(userProfile.avatar || "");
      setBio(userProfile.bio || "");
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authToken) {
      toast.error("Please authenticate your wallet first.");
      return;
    }

    setIsSaving(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name, email, avatar, bio }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update profile");
      }

      const data = await res.json();
      updateProfileState(data.data);
      toast.success("Profile details updated successfully!");
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel rounded-3xl p-12 border border-white/10 flex flex-col items-center">
          <Wallet className="w-12 h-12 text-cyan-400 mb-4" />
          <h2 className="text-xl font-bold text-slate-100">Wallet Not Connected</h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">
            Connect your Web3 wallet to access your profile settings and authentication session.
          </p>
          <button onClick={connect} className="glass-button text-sm font-semibold px-6 py-2.5">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="pb-8 mb-8 border-b border-darkBorder">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
          <User className="w-7 h-7 text-cyan-400" />
          <span>User Profile & Identity</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage off-chain metadata associated with your wallet address.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Wallet Details Card */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 p-1 mb-4">
            <div className="w-full h-full bg-darkBg rounded-full flex items-center justify-center overflow-hidden">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-cyan-400" />
              )}
            </div>
          </div>

          <h3 className="font-bold text-base text-slate-100">{name || "Anonymous User"}</h3>
          <p className="text-xs font-mono text-cyan-400 mt-1 break-all bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            {address.substring(0, 8)}...{address.substring(address.length - 6)}
          </p>

          <div className="w-full pt-4 mt-6 border-t border-white/10 space-y-2 text-left text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Balance:</span>
              <span className="text-purple-300 font-semibold">{balance} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Role:</span>
              <span className="text-emerald-400 font-semibold">{userProfile?.role || "USER"}</span>
            </div>
          </div>

          <button
            onClick={disconnect}
            className="w-full mt-6 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect Wallet</span>
          </button>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          <h3 className="font-bold text-lg text-slate-100 mb-6">Edit Profile Information</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Satoshi Nakamoto"
                className="w-full glass-input text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. satoshi@example.com"
                className="w-full glass-input text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="w-full glass-input text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell the dApp community about your Web3 role..."
                className="w-full glass-input text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="glass-button flex items-center gap-2 text-sm font-semibold min-w-[140px] justify-center"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-cyan-300" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
