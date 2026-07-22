import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile-view";
import { isNetwork } from "@/lib/cosign";

export async function generateMetadata({ params }: { params: Promise<{ network: string; address: string }> }): Promise<Metadata> {
  const { network, address } = await params;
  if (!isNetwork(network) || !address) return {};

  const networkLabel = network === "celo" ? "Celo" : "Stacks";
  const decodedAddress = decodeURIComponent(address);
  const compactAddress = decodedAddress.length > 12 ? `${decodedAddress.slice(0, 6)}…${decodedAddress.slice(-4)}` : decodedAddress;

  return {
    title: `${networkLabel} profile ${compactAddress}`,
    description: `Review public CoSign collaboration cards for ${compactAddress} on ${networkLabel}.`,
    alternates: { canonical: `/app/${network}/profile/${address}` }
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ network: string; address: string }> }) {
  const { network, address } = await params;
  if (!isNetwork(network) || !address) notFound();
  return <ProfileView network={network} address={decodeURIComponent(address)} />;
}
