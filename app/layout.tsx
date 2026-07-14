import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/manrope";
import "./globals.css";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.appUrl),
  title: { default: "CoSign — Make the moment mutual", template: "%s · CoSign" },
  description: "Create a public collaboration card and let the other wallet make it mutual on Celo or Stacks.",
  applicationName: "CoSign",
  keywords: ["CoSign", "Celo", "Stacks", "wallet collaboration", "co-signing", "public receipt"],
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "CoSign", statusBarStyle: "default" },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon-192.png", sizes: "192x192" }], apple: "/apple-touch-icon.png" },
  openGraph: { title: "CoSign — Make the moment mutual", description: "Two wallets. One shared public receipt.", images: [{ url: "/og.png", width: 1200, height: 630 }], type: "website" },
  twitter: { card: "summary_large_image", title: "CoSign — Make the moment mutual", description: "Two wallets. One shared public receipt.", images: ["/og.png"] },
  other: publicEnv.talentVerification ? { "talentapp:project_verification": publicEnv.talentVerification } : undefined
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F5F0E7", colorScheme: "light" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
