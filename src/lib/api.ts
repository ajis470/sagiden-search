const API_BASE = process.env.API_BASE!;
const API_SECRET = process.env.API_SECRET!;

const headers = {
  "X-API-Secret": API_SECRET,
  "Content-Type": "application/json",
};

export type DangerRank = "C" | "B" | "A" | "S" | "SS" | "SSS";

export type TrendingNumber = {
  number: string;
  danger_rank: DangerRank | null;
  comment_count: number;
  search_count_24h: number;
  summary: string | null;
};

export type AiSummary = {
  summary: string | null;
  recommended_action: string | null;
  danger_rank: DangerRank | null;
  highlights: string[];
};

export type PhoneNumber = {
  number: string;
  danger_rank: DangerRank | null;
  comment_count: number;
  search_count_24h: number;
  ai_summary: AiSummary | null;
  comments: Comment[];
};

export type Comment = {
  id: number;
  body: string;
  source: "user" | "scraped";
  status: "published" | "pending";
  created_at: string;
};

export type TrendingPeriod = "24h" | "7d" | "30d" | "danger";

export async function fetchTrending(period: TrendingPeriod = "24h", limit = 20): Promise<TrendingNumber[]> {
  try {
    const res = await fetch(`${API_BASE}/api_trending.php?period=${period}&limit=${limit}`, {
      headers,
      next: { revalidate: period === "24h" ? 300 : 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.trending ?? []).map((row: any) => ({
      number: row.phone_number,
      danger_rank: row.danger_rank ?? row.ai_rank ?? null,
      comment_count: Number(row.comment_count),
      search_count_24h: Number(row.search_count_24h),
      summary: row.summary ?? null,
    }));
  } catch {
    return [];
  }
}

export async function fetchPhone(number: string): Promise<PhoneNumber | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api_phone.php?number=${encodeURIComponent(number)}`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const d = json.data;
    if (!d) return null;
    return {
      number: d.phone_number,
      danger_rank: d.danger_rank ?? d.ai_summary?.danger_rank ?? null,
      comment_count: Number(d.comment_count),
      search_count_24h: Number(d.search_count_24h),
      ai_summary: d.ai_summary ?? null,
      comments: d.comments ?? [],
    };
  } catch {
    return null;
  }
}

export async function postComment(number: string, body: string): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/api_comment.php`, {
      method: "POST",
      headers,
      body: JSON.stringify({ phone_number: number, body }),
    });
    const json = await res.json();
    return { ok: res.ok, message: json.message ?? "" };
  } catch {
    return { ok: false, message: "通信エラーが発生しました" };
  }
}
