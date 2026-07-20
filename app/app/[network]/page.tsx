import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { isNetwork } from "@/lib/cosign";

export async function generateMetadata({ params }: { params: Promise<{ network: string }> }): Promise<Metadata> {
  const { network } = await params;
  if (!isNetwork(network)) return {};

  const networkLabel = network === "celo" ? "Celo" : "Stacks";

  return {
    title: `${networkLabel} dashboard`,
    description: `Create and review public CoSign collaboration cards on ${networkLabel}.`,
    alternates: { canonical: `/app/${network}` }
  };
}

export default async function NetworkDashboard({ params }: { params: Promise<{ network: string }> }) {
  const { network } = await params;
  if (!isNetwork(network)) notFound();
  return <Dashboard network={network} />;
}
