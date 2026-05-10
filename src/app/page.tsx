import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import DangerBadge from "@/components/DangerBadge";
import { fetchTrending, type TrendingNumber } from "@/lib/api";

export default async function Home() {
  const [danger, weekly, monthly, daily] = await Promise.all([
    fetchTrending("danger", 10),
    fetchTrending("7d", 10),
    fetchTrending("30d", 10),
    fetchTrending("24h", 10),
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
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <span className="text-sm text-gray-400">（{subtitle}）</span>}
      </div>
      <ol className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li key={item.number}>
            <Link
              href={`/tel/${item.number}`}
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
