import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchPhone } from "@/lib/api";
import DangerBadge from "@/components/DangerBadge";
import DangerRankPopover from "@/components/DangerRankPopover";
import CommentForm from "@/components/CommentForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ number: string }>; searchParams: Promise<{ admin?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { number } = await params;
  const { admin } = await searchParams;
  const phone = await fetchPhone(number);
  const formatted = formatNumber(number);
  const rank = phone?.danger_rank ?? "判定中";
  const count = phone?.comment_count ?? 0;
  const isAdmin = admin === process.env.ADMIN_KEY;
  return {
    title: `${formatted}｜危険度：${rank}｜口コミ ${count > 0 ? count : "-"}件 - みんなの迷惑電話番号データベース`,
    ...(isAdmin && { robots: { index: false, follow: false } }),
  };
}

export default async function TelPage({ params, searchParams }: Props) {
  const { number } = await params;
  const { admin } = await searchParams;
  const isAdmin = !!admin && admin === process.env.ADMIN_KEY;
  const phone = await fetchPhone(number);
  if (!phone) notFound();

  const rank = phone.danger_rank;
  const summary = phone.ai_summary;

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
            <h1 className="text-3xl font-bold text-gray-900 tracking-wider">
              {number}
            </h1>
            <span className="flex items-center gap-2 flex-wrap">
              <Link href="/danger-rank" className="text-sm text-gray-500 hover:underline">危険度：</Link>
              <DangerBadge rank={rank} showLabel />
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
                  {c.status === "pending" ? (
                    <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">この口コミは審査中です</p>
                  ) : (
                    <p className="text-gray-800 leading-7">{c.body}</p>
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
            投稿内容は確認後に掲載されます。誹謗中傷・個人情報を含む投稿は掲載されません。
          </p>
          <CommentForm number={number} />
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

function formatNumber(num: string): string {
  if (num.length === 11) {
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`;
  }
  if (num.length === 10) {
    return `${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6)}`;
  }
  return num;
}
