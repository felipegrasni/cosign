import type { Metadata } from "next";
import { AppEntryPage } from "@/components/app-entry-page";

export const metadata: Metadata = {
  title: "Choose a shared network",
  description: "Choose the same network both wallets will use, then create a public shared card and let the second wallet co-sign it from one clean link.",
  alternates: { canonical: "/app" },
  openGraph: {
    title: "Choose a shared network | CoSign",
    description: "Choose the same network both wallets will use, then create a public shared card and let the second wallet co-sign it from one clean link.",
    url: "/app",
    siteName: "CoSign",
    images: [{ url: "/og.png", width: 1200, height: 630 }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Choose a shared network | CoSign",
    description: "Choose the same network both wallets will use, then create a public shared card and let the second wallet co-sign it from one clean link.",
    images: ["/og.png"]
  }
};

export default function AppPage() {
  return <AppEntryPage />;
}
