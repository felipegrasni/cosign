import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { isNetwork } from "@/lib/cosign";

export async function generateMetadata({ params }: { params: Promise<{ network: string }> }): Promise<Metadata> {
  const { network } = await params;
  if (!isNetwork(network)) return {};

  const networkLabel = network === "celo" ? "Celo" : "Stacks";
  const title = `${networkLabel} dashboard`;
  const description = `Create and review public CoSign collaboration cards on ${networkLabel}.`;
  const url = `/app/${network}`;

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
      card: "summary_large_image",
      title: `${title} · CoSign`,
      description,
      images: ["/og.png"]
    }
  };
}

export default async function NetworkDashboard({ params }: { params: Promise<{ network: string }> }) {
  const { network } = await params;
  if (!isNetwork(network)) notFound();
  return <Dashboard network={network} />;
}
