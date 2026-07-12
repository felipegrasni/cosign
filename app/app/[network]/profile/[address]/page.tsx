import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile-view";
import { isNetwork } from "@/lib/cosign";

export default async function ProfilePage({ params }: { params: Promise<{ network: string; address: string }> }) {
  const { network, address } = await params;
  if (!isNetwork(network) || !address) notFound();
  return <ProfileView network={network} address={decodeURIComponent(address)} />;
}
