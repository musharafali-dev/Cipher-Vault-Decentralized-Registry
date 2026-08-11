import SecurityDashboard from "@/components/SecurityDashboard";

export const metadata = {
  title: "SecOps Security Center | Cipher Vault Decentralized Registry",
  description: "Real-time security auditing, smart contract circuit breaker monitoring, and SIWE session security for Cipher Vault.",
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SecurityDashboard />
    </main>
  );
}
