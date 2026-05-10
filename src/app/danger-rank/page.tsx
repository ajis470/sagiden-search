import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "危険度ランクについて - みんなの迷惑電話番号データベース",
  description:
    "迷惑電話の危険度ランク（C〜SSS）の意味と判定基準を解説します。",
};

const ranks = [
  {
    rank: "SSS",
    color: "bg-purple-800 text-white",
    label: "特殊詐欺・非常に危険",
    desc: "オレオレ詐欺・還付金詐欺など、特殊詐欺の実行犯からの電話です。絶対に個人情報や金銭を渡してはいけません。",
    examples: ["「息子だけど事故を起こした」などと家族を装う", "「還付金があります」と自動音声で誘導する"],
  },
  {
    rank: "SS",
    color: "bg-red-600 text-white",
    label: "詐欺の前兆・要注意",
    desc: "詐欺の準備段階とみられる電話です。家族構成・資産・生活パターンなどを聞き出そうとするアポ電が典型例です。",
    examples: ["「アンケートです」と個人情報を聞き出そうとする", "「家族は何人ですか」などと生活状況を調査する"],
  },
  {
    rank: "S",
    color: "bg-orange-500 text-white",
    label: "詐欺電話の疑いあり",
    desc: "架空請求・偽のサポートセンターなど、実害が出る前の詐欺的な手口が報告されている番号です。",
    examples: ["「未払いの料金があります」と脅す架空請求", "「パソコンにウイルスが検出されました」と偽るサポート詐欺"],
  },
  {
    rank: "A",
    color: "bg-yellow-500 text-gray-900",
    label: "悪質な迷惑電話",
    desc: "しつこい勧誘や解約妨害など、迷惑度が高い電話です。すぐに電話を切って問題ありません。",
    examples: ["断っても何度もかけてくるしつこい営業", "解約しようとすると強引に引き留める"],
  },
  {
    rank: "B",
    color: "bg-blue-500 text-white",
    label: "軽度の迷惑電話",
    desc: "営業・勧誘電話ですが、悪質度は低い番号です。不要であれば断れば問題ありません。",
    examples: ["一般的な営業電話・アンケート", "1〜2回かけてくる程度の勧誘"],
  },
  {
    rank: "C",
    color: "bg-gray-400 text-white",
    label: "正規・情報不足",
    desc: "正規の企業・公的機関からの電話、または情報が少なく判定できない番号です。折り返す前に番号を調べることをおすすめします。",
    examples: ["役所・病院・宅配会社などからの連絡", "口コミが少なく危険度が判定できない番号"],
  },
];

export default function DangerRankPage() {
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

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">危険度ランクについて</h1>
          <p className="mt-2 text-gray-500 text-sm leading-7">
            各番号には、寄せられた情報をもとに C〜SSS の6段階で危険度を表示しています。
            ランクが高いほど注意が必要です。
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {ranks.map(({ rank, color, label, desc, examples }) => (
            <div
              key={rank}
              className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${color}`}>
                  {rank}
                </span>
                <span className="font-bold text-gray-900">{label}</span>
              </div>
              <p className="text-gray-700 text-sm leading-7">{desc}</p>
              <ul className="flex flex-col gap-1">
                {examples.map((ex, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-500">
                    <span className="shrink-0">例）</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 leading-6">
          ※ 危険度ランクは寄せられた口コミをもとに判定しています。
          正確性を保証するものではありません。
          不審な電話を受けた場合は、最寄りの警察署や
          <a
            href="https://www.npa.go.jp/bureau/safetylife/sos47/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1"
          >
            警察庁の相談窓口
          </a>
          にご相談ください。
        </p>
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
        <p>みんなの迷惑電話番号データベース</p>
      </footer>
    </div>
  );
}
