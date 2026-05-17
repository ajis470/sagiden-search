import { MetadataRoute } from "next";

const BASE_URL = "https://sagiden-search.com";
const API_BASE = process.env.API_BASE!;
const API_SECRET = process.env.API_SECRET!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/danger-rank`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const res = await fetch(`${API_BASE}/api_sitemap.php`, {
      headers: { "X-API-Secret": API_SECRET },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return staticPages;

    const data = await res.json();
    const dynamicPages: MetadataRoute.Sitemap = (data.numbers ?? []).map(
      (row: { number: string; updated_at: string }) => ({
        url: `${BASE_URL}/tel/${row.number}`,
        lastModified: new Date(row.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    );

    return [...staticPages, ...dynamicPages];
  } catch {
    return staticPages;
  }
}
