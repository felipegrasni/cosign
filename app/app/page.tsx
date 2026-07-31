import type { Metadata } from "next";
import { AppEntryPage } from "@/components/app-entry-page";

export const metadata: Metadata = {
  title: "Choose a shared network",
  description: "Choose Celo or Stacks before both wallets create or co-sign a public shared card. Inside MiniPay, CoSign opens Celo automatically.",
  alternates: { canonical: "/app" },
  openGraph: {
    title: "Choose a shared network | CoSign",
    description: "Choose Celo or Stacks before both wallets create or co-sign a public shared card. Inside MiniPay, CoSign opens Celo automatically.",
    url: "/app",
    siteName: "CoSign",
    images: [{ url: "/og.png", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Choose a shared network | CoSign",
    description: "Choose Celo or Stacks before both wallets create or co-sign a public shared card. Inside MiniPay, CoSign opens Celo automatically.",
    images: ["/og.png"]
  }
};

export default function AppPage() {
  return <AppEntryPage />;
}
