import type { Metadata } from "next";
import { AppEntryPage } from "@/components/app-entry-page";

export const metadata: Metadata = {
  title: "Choose a network",
  description: "Choose the network both wallets will use to co-sign on Celo or Stacks before creating a public CoSign card.",
  alternates: { canonical: "/app" },
  openGraph: {
    title: "Choose a network | CoSign",
    description: "Choose the network both wallets will use to co-sign on Celo or Stacks before creating a public CoSign card.",
    url: "/app",
    siteName: "CoSign",
    images: [{ url: "/og.png", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Choose a network | CoSign",
    description: "Choose the network both wallets will use to co-sign on Celo or Stacks before creating a public CoSign card.",
    images: ["/og.png"]
  }
};

export default function AppPage() {
  return <AppEntryPage />;
}
