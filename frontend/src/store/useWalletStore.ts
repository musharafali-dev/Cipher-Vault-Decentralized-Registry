import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ethers } from "ethers";

export interface UserProfile {
  id: string;
  address: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  role: string;
  createdAt: string;
}

interface WalletState {
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  authToken: string | null;
  userProfile: UserProfile | null;
  error: string | null;

  connect: () => Promise<void>;
  disconnect: () => void;
  authenticate: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  updateProfileState: (profile: Partial<UserProfile>) => void;
  setError: (err: string | null) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      chainId: null,
      balance: null,
      isConnected: false,
      isConnecting: false,
      authToken: null,
      userProfile: null,
      error: null,

      connect: async () => {
        set({ isConnecting: true, error: null });
        try {
          if (typeof window === "undefined" || !(window as any).ethereum) {
            throw new Error("MetaMask or compatible Web3 wallet not found in browser.");
          }

          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);

          if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found in connected wallet.");
          }

          const address = accounts[0];
          const network = await provider.getNetwork();
          const rawBalance = await provider.getBalance(address);
          const balance = ethers.formatEther(rawBalance);

          set({
            address,
            chainId: Number(network.chainId),
            balance: parseFloat(balance).toFixed(4),
            isConnected: true,
            isConnecting: false,
          });

          // Attempt wallet authentication with backend
          get().authenticate().catch((err) => console.warn("Backend auth deferred:", err));
        } catch (error: any) {
          set({
            isConnecting: false,
            error: error.message || "Failed to connect Web3 wallet.",
          });
        }
      },

      disconnect: () => {
        set({
          address: null,
          chainId: null,
          balance: null,
          isConnected: false,
          authToken: null,
          userProfile: null,
          error: null,
        });
      },

      authenticate: async (): Promise<boolean> => {
        const { address } = get();
        if (!address || typeof window === "undefined" || !(window as any).ethereum) {
          return false;
        }

        try {
          // 1. Get Nonce
          const nonceRes = await fetch(`${API_BASE}/auth/nonce`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          });

          if (!nonceRes.ok) {
            throw new Error("Failed to request authentication nonce");
          }

          const nonceData = await nonceRes.json();
          const nonce = nonceData.data.nonce;

          // 2. Sign Nonce
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const signer = await provider.getSigner();
          const signature = await signer.signMessage(nonce);

          // 3. Verify Signature
          const verifyRes = await fetch(`${API_BASE}/auth/verify-signature`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, signature }),
          });

          if (!verifyRes.ok) {
            const errData = await verifyRes.json();
            throw new Error(errData.error || "Signature verification failed");
          }

          const authData = await verifyRes.json();
          set({
            authToken: authData.data.token,
            userProfile: authData.data.user,
          });

          return true;
        } catch (error: any) {
          console.error("Wallet authentication error:", error);
          set({ error: error.message });
          return false;
        }
      },

      refreshBalance: async () => {
        const { address } = get();
        if (!address || typeof window === "undefined" || !(window as any).ethereum) return;

        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const rawBalance = await provider.getBalance(address);
          set({ balance: parseFloat(ethers.formatEther(rawBalance)).toFixed(4) });
        } catch (err) {
          console.error("Failed to refresh balance:", err);
        }
      },

      updateProfileState: (updatedFields) => {
        const current = get().userProfile;
        if (current) {
          set({ userProfile: { ...current, ...updatedFields } });
        }
      },

      setError: (err) => set({ error: err }),
    }),
    {
      name: "web3-wallet-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        address: state.address,
        authToken: state.authToken,
        userProfile: state.userProfile,
      }),
    }
  )
);
