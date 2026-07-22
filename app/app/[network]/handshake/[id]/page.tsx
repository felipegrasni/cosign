import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HandshakeDetail } from "@/components/handshake-detail";
import { isNetwork } from "@/lib/cosign";

export async function generateMetadata({ params }: { params: Promise<{ network: string; id: string }> }): Promise<Metadata> {
  const { network, id } = await params;
  if (!isNetwork(network) || !/^\d+$/.test(id) || id === "0") return {};

  const networkLabel = network === "celo" ? "Celo" : "Stacks";
  const title = `${networkLabel} card #${id}`;
  const description = `Open public CoSign card #${id} on ${networkLabel}.`;
  const url = `/app/${network}/handshake/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · CoSign`,
      description,
      url
    },
    twitter: {
      title: `${title} · CoSign`,
      description
    }
  };
}

export default async function HandshakePage({ params }: { params: Promise<{ network: string; id: string }> }) {
  const { network, id } = await params;
  if (!isNetwork(network) || !/^\d+$/.test(id) || id === "0") notFound();
  return <HandshakeDetail network={network} id={BigInt(id)} />;
}
