import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "特殊詐欺の主な手口と見分け方 - みんなの迷惑電話番号データベース",
  description:
    "オレオレ詐欺・還付金詐欺・架空請求・サポート詐欺・アポ電など、電話を使った特殊詐欺の代表的な手口と、それぞれの典型的な言い回し・見分け方・対処法をまとめました。危険度ランクとの対応もあわせて解説します。",
};

const scams = [
  {
    name: "オレオレ詐欺（家族なりすまし）",
    rank: "SSS",
    lines: ["「俺だけど、携帯の番号が変わった」", "「事故を起こしてしまって、今すぐお金が必要」"],
    tell: "家族を装い、動揺させてお金を急がせるのが特徴。少しでも怪しければ、いったん切って本人の元の番号にかけ直せば必ず見破れます。",
  },
  {
    name: "還付金詐欺",
    rank: "SSS",
    lines: ["「医療費の還付金があります」", "「ATMで手続きできます。今すぐ向かってください」"],
    tell: "役所や年金機構を名乗り、ATMへ誘導するのが典型。ATMの操作でお金が「戻ってくる」ことは絶対にありません。",
  },
  {
    name: "架空請求・未払い料金詐欺",
    rank: "S",
    lines: ["「利用料金が未払いです。本日中に支払わないと法的措置を取ります」", "「有料サイトの登録が残っています」"],
    tell: "身に覚えのない請求で不安をあおり、コンビニのプリペイドカードや電子マネーで支払わせようとします。正規の請求でこの支払い方法を指定することはありません。",
  },
  {
    name: "サポート詐欺（偽の警告）",
    rank: "S",
    lines: ["「パソコンがウイルスに感染しています」", "「この番号に今すぐ電話してください」"],
    tell: "パソコンやスマホに突然警告画面を出し、表示された番号に電話させて遠隔操作や高額なサポート契約に誘導します。画面の警告と電話番号は無視して構いません。",
  },
  {
    name: "アポ電（事前の下見電話）",
    rank: "SS",
    lines: ["「アンケートにご協力ください」", "「ご家族は何人ですか」「今、家に現金はありますか」"],
    tell: "強盗や詐欺の準備として、家族構成・資産・在宅状況を聞き出す電話。生活状況を尋ねられたら答えず、すぐ切りましょう。",
  },
];

const rankColor: Record<string, string> = {
  SSS: "bg-purple-800 text-white",
  SS: "bg-red-600 text-white",
  S: "bg-orange-500 text-white",
};

export default function ScamTypesPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">特殊詐欺の主な手口と見分け方</h1>
          <p className="mt-2 text-gray-500 text-sm leading-7">
            電話を使った特殊詐欺には、いくつかの決まったパターンがあります。
            代表的な手口と「よく使われる言い回し」を知っておけば、
            実際にかかってきたときに冷静に見分けられます。
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {scams.map(({ name, rank, lines, tell }) => (
            <section
              key={name}
              className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${rankColor[rank]}`}
                >
                  危険度 {rank}
                </span>
                <h2 className="font-bold text-gray-900">{name}</h2>
              </div>
              <div className="flex flex-col gap-1">
                {lines.map((line, i) => (
                  <p key={i} className="text-sm text-gray-500 italic leading-7">
                    {line}
                  </p>
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-7">
                <span className="font-bold text-gray-900">見分け方：</span>
                {tell}
              </p>
            </section>
          ))}
        </div>

        <section className="bg-red-50 rounded-2xl border border-red-100 px-6 py-5 flex flex-col gap-2">
          <h2 className="font-bold text-gray-900">かかってきた番号を確かめる</h2>
          <p className="text-gray-700 text-sm leading-7">
            同じ番号が複数の人から詐欺として報告されていることもあります。
            着信のあった番号を当サイトで検索し、口コミと危険度を確認してから対応しましょう。
          </p>
          <div className="flex flex-wrap gap-3 mt-1 text-sm">
            <Link href="/" className="text-red-600 underline font-bold">
              番号を検索する →
            </Link>
            <Link href="/danger-rank" className="text-gray-600 underline">
              危険度ランクの見方 →
            </Link>
            <Link href="/guide/after-scammed" className="text-gray-600 underline">
              被害に遭った場合の対処法 →
            </Link>
            <Link href="/guide/protect-elderly" className="text-gray-600 underline">
              高齢の家族を守る方法 →
            </Link>
          </div>
        </section>

        <p className="text-xs text-gray-400 leading-6">
          ※ 詐欺被害にあった、またはあいそうになった場合は、警察相談専用電話「＃9110」や
          最寄りの警察署、
          <a
            href="https://www.npa.go.jp/bureau/safetylife/sos47/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1"
          >
            警察庁の相談窓口
          </a>
          にすぐご相談ください。
        </p>
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
        <p>みんなの迷惑電話番号データベース</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy-policy" className="underline">プライバシーポリシー</Link>
        </div>
      </footer>
    </div>
  );
}
