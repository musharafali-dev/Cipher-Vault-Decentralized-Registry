/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        sans: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        vaultBg: "#0b0f17",
        vaultSurface: "#121824",
        vaultCard: "rgba(18, 24, 36, 0.8)",
        vaultBorder: "rgba(255, 255, 255, 0.08)",
        amberGold: {
          50: "#fffbeb",
          100: "#fef3c7",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        emeraldVault: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
      },
      backgroundImage: {
        "vault-glow": "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.12), transparent 75%)",
        "gold-gradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "emerald-gradient": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "accent-vault-gradient": "linear-gradient(135deg, #f59e0b 0%, #10b981 50%, #6366f1 100%)",
      },
      boxShadow: {
        vault: "0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
        glowGold: "0 0 25px -2px rgba(245, 158, 11, 0.35)",
        glowEmerald: "0 0 25px -2px rgba(16, 185, 129, 0.35)",
      },
    },
  },
  plugins: [],
};
