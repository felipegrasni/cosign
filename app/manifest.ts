import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "CoSign", short_name: "CoSign", description: "Make the moment mutual.", start_url: "/app", display: "standalone", background_color: "#F5F0E7", theme_color: "#F5F0E7", icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }] };
}
