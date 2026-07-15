import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    host: publicEnv.appUrl,
    sitemap: `${publicEnv.appUrl}/sitemap.xml`
  };
}
