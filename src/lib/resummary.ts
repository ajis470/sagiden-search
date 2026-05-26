const API_BASE = process.env.API_BASE!;
const API_SECRET = process.env.API_SECRET!;

// コメント投稿時に needs_resummary=1 をセットするだけ。
// 実際の jpnumber スクレイプ＋AI要約は Windows の hourly_new_reviews.js が担当。
export async function triggerResummarize(number: string) {
  try {
    await fetch(`${API_BASE}/api_scrape.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: API_SECRET,
        phone_number: number,
        comments: [],
        source: "scraped",
        source_site: "jpnumber.com",
        force_resummary: true,
      }),
    });
    console.log(`[resummary] ${number}: needs_resummary セット → hourly待ち`);
  } catch (e) {
    console.error(`[resummary] ${number}: エラー`, e);
  }
}
