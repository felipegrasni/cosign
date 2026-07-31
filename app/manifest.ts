import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const description = "Create a public shared card, share one clean link, and let a second wallet co-sign it on Celo or Stacks as long as both wallets use the same network.";

  return {
    id: "/app",
    name: "CoSign",
    short_name: "CoSign",
    description,
    lang: "en",
    start_url: "/app",
    scope: "/app",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#F5F0E7",
    theme_color: "#F5F0E7",
    categories: ["social", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    shortcuts: [
      {
        name: "Create or co-sign on Celo",
        short_name: "Celo",
        description: "Jump straight to the Celo flow to create or co-sign a shared card.",
        url: "/app/celo",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "Create or co-sign on Stacks",
        short_name: "Stacks",
        description: "Jump straight to the Stacks flow to create or co-sign a shared card.",
        url: "/app/stacks",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      }
    ]
  };
}
