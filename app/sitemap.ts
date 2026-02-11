import type { MetadataRoute } from "next";

const baseUrl = "https://prayhouse.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "",
    "/about",
    "/prayers",
    "/prayers/new",
    "/gratitude",
    "/gratitude/others",
    "/missions",
    "/missions/new",
    "/profile",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
