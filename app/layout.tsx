import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/manrope";
import "./globals.css";
import { publicEnv } from "@/lib/env";

const description = "Create a public shared card, share one clean link, and let a second wallet co-sign it on Celo or Stacks as long as both wallets use the same network.";
const socialDescription = "Create a public shared card, share one clean link, and let a second wallet co-sign it on Celo or Stacks as long as both wallets use the same network.";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.appUrl),
  title: { default: "CoSign — Make the moment mutual", template: "%s · CoSign" },
  description,
  applicationName: "CoSign",
  alternates: { canonical: "/" },
  category: "social networking",
  keywords: ["CoSign", "MiniPay", "Celo", "Stacks", "shared cards", "co-signing", "wallet-to-wallet", "public receipt"],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "CoSign", statusBarStyle: "default" },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192" }], apple: "/apple-touch-icon.png" },
  openGraph: { title: "CoSign — Make the moment mutual", description: socialDescription, url: "/", siteName: "CoSign", images: [{ url: "/og.png", width: 1200, height: 630 }], type: "website" },
  twitter: { card: "summary_large_image", title: "CoSign — Make the moment mutual", description: socialDescription, images: ["/og.png"] },
  other: publicEnv.talentVerification ? { "talentapp:project_verification": publicEnv.talentVerification } : undefined
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F5F0E7", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main-content">Skip to main content</a>{children}</body></html>;
}
