import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nabd | نبض",
    short_name: "Nabd",
    description: "نظام إدارة المبيعات والمخازن",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#a78bfa",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}