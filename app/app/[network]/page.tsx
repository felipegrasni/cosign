import { notFound } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { isNetwork } from "@/lib/cosign";

export default async function NetworkDashboard({ params }: { params: Promise<{ network: string }> }) {
  const { network } = await params;
  if (!isNetwork(network)) notFound();
  return <Dashboard network={network} />;
}
