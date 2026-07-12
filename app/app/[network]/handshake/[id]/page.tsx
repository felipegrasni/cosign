import { notFound } from "next/navigation";
import { HandshakeDetail } from "@/components/handshake-detail";
import { isNetwork } from "@/lib/cosign";

export default async function HandshakePage({ params }: { params: Promise<{ network: string; id: string }> }) {
  const { network, id } = await params;
  if (!isNetwork(network) || !/^\d+$/.test(id) || id === "0") notFound();
  return <HandshakeDetail network={network} id={BigInt(id)} />;
}
