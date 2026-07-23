import type { Metadata } from "next";
import { AppEntryPage } from "@/components/app-entry-page";

export const metadata: Metadata = {
  title: "Choose network",
  description: "Choose whether both wallets will co-sign on Celo or Stacks before creating a public CoSign card.",
  alternates: { canonical: "/app" },
  openGraph: {
    title: "Choose network | CoSign",
    description: "Choose whether both wallets will co-sign on Celo or Stacks before creating a public CoSign card.",
    url: "/app"
  },
  twitter: {
    title: "Choose network | CoSign",
    description: "Choose whether both wallets will co-sign on Celo or Stacks before creating a public CoSign card."
  }
};

export default function AppPage() {
  return <AppEntryPage />;
}
