import type { MetadataRoute } from "next";
import {
  isServerDbConfigured,
  getAllPublicBoardIdsServer,
  getAllTagNamesServer,
  getAllUserIdsServer,
} from "@/lib/firestore-server";

const BASE_URL = "https://orotoo.web.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages always included
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/boards`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // If the server database is not configured, return only static pages
  if (!isServerDbConfigured) {
    return staticPages;
  }

  try {
    const [boardIds, tagNames, userIds] = await Promise.all([
      getAllPublicBoardIdsServer(),
      getAllTagNamesServer(),
      getAllUserIdsServer(),
    ]);

    const boardPages: MetadataRoute.Sitemap = boardIds.map((id) => ({
      url: `${BASE_URL}/boards/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const tagPages: MetadataRoute.Sitemap = tagNames.map((name) => ({
      url: `${BASE_URL}/tags/${encodeURIComponent(name)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

    const userPages: MetadataRoute.Sitemap = userIds.map((id) => ({
      url: `${BASE_URL}/profile/${id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

    return [...staticPages, ...boardPages, ...tagPages, ...userPages];
  } catch (error) {
    console.error("sitemap generation failed, returning static pages:", error);
    return staticPages;
  }
}
