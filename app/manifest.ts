import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const description = "Create a public collaboration card and invite another wallet to make it mutual on Celo or Stacks.";

  return {
    id: "/app",
    name: "CoSign",
    short_name: "CoSign",
    description,
    lang: "en",
    start_url: "/app",
    scope: "/app",
    display: "standalone",
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
        name: "Choose Celo",
        short_name: "Celo",
        description: "Choose the Celo network in CoSign.",
        url: "/app/celo",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      },
      {
        name: "Choose Stacks",
        short_name: "Stacks",
        description: "Choose the Stacks network in CoSign.",
        url: "/app/stacks",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }]
      }
    ]
  };
}
