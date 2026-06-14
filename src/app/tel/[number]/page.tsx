import { notFound } from "next/navigation";
import { after } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchPhone } from "@/lib/api";
import { triggerResummarize } from "@/lib/resummary";
import DangerBadge from "@/components/DangerBadge";
import DangerRankPopover from "@/components/DangerRankPopover";
import CommentForm from "@/components/CommentForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ admin?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { number: rawNumber } = await params;
  const number = rawNumber.startsWith("plus") ? "+" + rawNumber.slice(4) : rawNumber;
  const { admin } = await searchParams;
  const phone = await fetchPhone(number);
  const formatted = formatNumber(number);
  const rank = phone?.danger_rank ?? null;
  const displayRank = rank ?? "判定中";
  const isAdmin = admin === process.env.ADMIN_KEY;
  const summary = phone?.ai_summary?.summary;
  const rankLabel = rank ? `　${RANK_LABELS[rank]}` : "";
  const description = summary
    ? `危険度：${displayRank}${rankLabel}。${summary}`
    : `${formatted}は迷惑電話？危険度・着信時間帯・口コミ・対処法をまとめています。`;
  return {
    title: `${buildHeading(formatted, rank)} - みんなの迷惑電話番号データベース`,
    description,
    ...(isAdmin && { robots: { index: false, follow: false } }),
  };
}

export default async function TelPage({ params, searchParams }: Props) {
  const { number: rawNumber } = await params;
  const number = rawNumber.startsWith("plus") ? "+" + rawNumber.slice(4) : rawNumber;
  const { admin } = await searchParams;
  const isAdmin = !!admin && admin === process.env.ADMIN_KEY;
  const phone = await fetchPhone(number);
  if (!phone) notFound();

  // サマリーがない番号は初回アクセス時にバックグラウンドで即時要約
  if (!phone.ai_summary) {
    after(triggerResummarize(number));
  }

  const rank = phone.danger_rank;
  const summary = phone.ai_summary;
  const formatted = formatNumber(number);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
            ← トップ
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-gray-900 text-sm">
            みんなの迷惑電話番号データベース
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
        {/* 番号・危険度 */}
        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* H1のテキストは<title>の本文部分と完全一致させる（検索エンジンのタイトル書き換え対策） */}
            <h1 className="text-gray-900 flex flex-wrap items-baseline gap-x-1">
              <span className="text-3xl font-bold tracking-wider">{formatted}</span>
              <span className="text-base font-semibold text-gray-600">{headingSuffix(rank)}</span>
            </h1>
            <span className="flex items-center gap-2 flex-wrap">
              <Link href="/danger-rank" className="text-sm text-gray-500 hover:underline">危険度：</Link>
              <DangerBadge rank={rank} showLabel noData={!rank && phone.comments.length === 0} />
              <DangerRankPopover />
            </span>
          </div>
        </section>

        {/* まとめ */}
        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg text-gray-900">この番号について</h2>
          {summary?.summary ? (
            <p className="text-gray-700 leading-7">{summary.summary}</p>
          ) : (
            <p className="text-gray-400 text-sm">
              まだ情報が集まっていません。口コミを投稿してみんなに教えてください。
            </p>
          )}
          {summary?.recommended_action && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm font-bold text-red-700 mb-1">こんなときは</p>
              <p className="text-sm text-red-800">{summary.recommended_action}</p>
            </div>
          )}
        </section>

        {/* みんなから集まった情報 */}
        {summary?.highlights && summary.highlights.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 px-6 py-6 flex flex-col gap-4">
            <h2 className="font-bold text-lg text-gray-900">みんなから集まったこの番号に対する情報</h2>
            <ul className="flex flex-col gap-3">
              {summary.highlights.map((h, i) => (
                <li key={i} className="flex gap-3 text-gray-700 leading-7">
                  <span className="text-red-400 shrink-0 mt-0.5">●</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 口コミ一覧 */}
        <section className="flex flex-col gap-4">
          <h2 className="font-bold text-lg text-gray-900">口コミ</h2>
          {phone.comments.length === 0 ? (
            <p className="text-gray-400 text-sm">まだ口コミはありません。最初の投稿者になりましょう。</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {phone.comments.map((c) => (
                <li
                  key={c.id}
                  className="bg-white rounded-xl border border-gray-200 px-5 py-4"
                >
                  {c.call_type && (
                    <span className="inline-block mb-2 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {{ call: "通話", sms: "SMS", missed: "不在着信", voicemail: "留守電" }[c.call_type]}
                    </span>
                  )}
                  {c.status === "pending" ? (
                    <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">この口コミは審査中です</p>
                  ) : (
                    <p className="text-gray-800 leading-7 whitespace-pre-wrap">{c.body}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString("ja-JP")}
                    {c.source === "scraped" && "　※他サイトの口コミをAIが要約・浄化したものです"}
                    {isAdmin && <span className="ml-2 font-mono text-gray-300">#{c.id}</span>}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* 口コミ投稿 */}
        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg text-gray-900">口コミを投稿する</h2>
          <p className="text-sm text-gray-500">
            誹謗中傷・個人情報を含む投稿は掲載されません。
          </p>
          <CommentForm number={number} adminKey={isAdmin ? admin : undefined} />
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
        <p>みんなの迷惑電話番号データベース</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/danger-rank" className="underline">危険度ランクについて</Link>
          <Link href="/contact" className="underline">掲載内容の問題を報告</Link>
        </div>
      </footer>
    </div>
  );
}

const RANK_LABELS: Record<string, string> = {
  C: "正規・情報不足", B: "軽度の迷惑電話", A: "悪質な迷惑電話",
  S: "詐欺電話の疑いあり", SS: "詐欺の前兆・要注意", SSS: "特殊詐欺・非常に危険",
};

// 番号に続く訴求フレーズ（H1・titleで共通利用）
function headingSuffix(rank: string | null): string {
  if (rank && RANK_LABELS[rank]) {
    return `は迷惑電話？【危険度${rank}：${RANK_LABELS[rank]}】`;
  }
  return "は安全？迷惑電話？口コミ・危険度をチェック";
}

// <title>とH1の本文部分を一致させるための共通文字列
function buildHeading(formatted: string, rank: string | null): string {
  return `${formatted}${headingSuffix(rank)}`;
}

function formatNumber(num: string): string {
  if (num.startsWith("+")) return num;
  if (num.length === 11) {
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`;
  }
  if (num.length === 10) {
    return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
  }
  return num;
}
