import Link from "next/link";
import Image from "next/image";
import SearchBox from "@/components/SearchBox";
import DangerBadge from "@/components/DangerBadge";
import { fetchTrending, fetchLists, type TrendingNumber } from "@/lib/api";

export default async function Home() {
  const [danger, weekly, monthly, daily, { newArrivals }] = await Promise.all([
    fetchTrending("danger", 10),
    fetchTrending("7d", 10),
    fetchTrending("30d", 10),
    fetchTrending("24h", 10),
    fetchLists(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          <span className="font-bold text-lg text-gray-900">
            みんなの迷惑電話番号データベース
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 flex flex-col gap-10">
        {/* 検索 */}
        <section className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/hero.png"
            alt="みんなの声で、怪しい着信を防ぐ。"
            width={1500}
            height={500}
            className="w-full rounded-2xl"
            priority
          />
          <a
            href="https://x.com/sagidensearch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Xでフォローして最新情報を受け取る
          </a>
          <h1 className="text-2xl font-bold text-gray-900">
            その電話番号、大丈夫ですか？
          </h1>
          <p className="text-gray-500">
            番号入力で危険度・口コミ・対処法が調べられます
          </p>
          <SearchBox />
        </section>

        {/* 危険度が高い番号（常設） */}
        {danger.length > 0 && (
          <RankingSection
            icon="⚠️"
            title="特に注意が必要な番号"
            items={danger}
            showCount={false}
          />
        )}

        {/* 24時間ランキング（1件以上あるときだけ表示） */}
        {daily.length > 0 && (
          <RankingSection
            icon="🔥"
            title="いま急増中の番号"
            subtitle="過去24時間"
            items={daily}
          />
        )}

        {/* 週間ランキング */}
        {weekly.length > 0 && (
          <RankingSection
            icon="📊"
            title="週間ランキング"
            subtitle="過去7日間"
            items={weekly}
          />
        )}

        {/* 月間ランキング */}
        {monthly.length > 0 && (
          <RankingSection
            icon="📅"
            title="月間ランキング"
            subtitle="過去30日間"
            items={monthly}
          />
        )}
        {/* 新着番号 */}
        {newArrivals.length > 0 && (
          <NumberListSection
            icon="🆕"
            title="新着番号"
            subtitle="新たに情報が集まった番号"
            numbers={newArrivals}
          />
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
        <p>みんなの迷惑電話番号データベース</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/danger-rank" className="underline">危険度ランクについて</Link>
          <Link href="/contact" className="underline">掲載内容の問題を報告</Link>
          <a href="https://x.com/sagidensearch" target="_blank" rel="noopener noreferrer" className="underline">X（旧Twitter）</a>
        </div>
      </footer>
    </div>
  );
}

function toTelUrl(number: string) {
  return `/tel/${number.startsWith("+") ? "plus" + number.slice(1) : number}`;
}

function NumberListSection({
  icon,
  title,
  subtitle,
  numbers,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  numbers: string[];
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6">
      <div className="flex items-center gap-2 mb-1 bg-gradient-to-r from-blue-200 to-transparent rounded-xl pl-3 py-2 border-2 border-blue-300">
        <span className="text-xl">{icon}</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-400 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div className="flex flex-wrap gap-2">
        {numbers.map((number) => (
          <Link
            key={number}
            href={toTelUrl(number)}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            {number}
          </Link>
        ))}
      </div>
    </section>
  );
}

function RankingSection({
  icon,
  title,
  subtitle,
  items,
  showCount = true,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  items: TrendingNumber[];
  showCount?: boolean;
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6">
      <div className="flex items-center gap-2 mb-4 bg-gradient-to-r from-blue-200 to-transparent rounded-xl pl-3 py-2 border-2 border-blue-300">
        <span className="text-xl">{icon}</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <span className="text-sm text-gray-400">（{subtitle}）</span>}
      </div>
      <ol className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={item.number}>
            <Link
              href={toTelUrl(item.number)}
              className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 px-5 py-4 hover:border-red-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl font-bold text-gray-300 w-7 shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900 text-lg">
                    {item.number}
                  </span>
                  <DangerBadge rank={item.danger_rank} />
                </div>
                {item.summary && (
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {item.summary}
                  </p>
                )}
              </div>
              {showCount && item.search_count_24h > 0 && (
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-red-600">
                    {item.search_count_24h.toLocaleString()}件
                  </div>
                  <div className="text-xs text-gray-400">検索</div>
                </div>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
