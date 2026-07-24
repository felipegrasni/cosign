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
  const title = `${networkLabel} profile ${compactAddress}`;
  const description = `Review public CoSign collaboration cards for ${compactAddress} on ${networkLabel}.`;
  const url = `/app/${network}/profile/${address}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · CoSign`,
      description,
      url,
      siteName: "CoSign",
      images: [{ url: "/og.png", width: 1200, height: 630 }]
    },
    twitter: {
      title: `${title} · CoSign`,
      description,
      card: "summary_large_image",
      images: ["/og.png"]
    }
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ network: string; address: string }> }) {
  const { network, address } = await params;
  if (!isNetwork(network) || !address) notFound();
  return <ProfileView network={network} address={decodeURIComponent(address)} />;
}
