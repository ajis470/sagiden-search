import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "知らない番号から着信があったときの対処法 - みんなの迷惑電話番号データベース",
  description:
    "知らない電話番号から着信があったとき、折り返す前に確認すべきことや、出てしまった場合の正しい対応、折り返してはいけない番号の特徴をわかりやすく解説します。詐欺・迷惑電話の被害を防ぐための基本手順をまとめました。",
};

const sections = [
  {
    heading: "折り返す前に確認すること",
    body: "知らない番号からの着信に、慌ててその場で折り返す必要はありません。まずは落ち着いて、次の3つを確認しましょう。",
    items: [
      "番号をそのまま検索する（当サイトのような番号データベースや検索エンジンで、迷惑電話の報告がないか調べる）",
      "先頭の番号を確認する（「+」や「010」から始まる国際電話、「050」のIP電話は、心当たりがなければ折り返さない）",
      "留守番電話を待つ（本当に用事のある相手なら、多くの場合メッセージを残します。何も残らない着信は急いで対応しなくて構いません）",
    ],
  },
  {
    heading: "出てしまった場合の対応",
    body: "うっかり出てしまっても、以下を守れば被害はほぼ防げます。相手のペースに乗らないことが何より大切です。",
    items: [
      "名前・住所・生年月日・家族構成などの個人情報は言わない",
      "「はい」「そうです」など、録音されて悪用されうる返事を安易にしない",
      "少しでも不審に感じたら、理由を説明せずにすぐ電話を切る",
      "お金・還付金・未払い料金の話が出たら、その時点で詐欺を疑う",
    ],
  },
  {
    heading: "折り返してはいけない番号の特徴",
    body: "次のような着信は、折り返すこと自体がリスクになります。折り返しによって高額な通話料が発生したり、「反応する番号」として狙われ続けたりする恐れがあります。",
    items: [
      "1〜2コールですぐ切れる「ワン切り」",
      "「+」から始まる、心当たりのない国際電話",
      "深夜・早朝など非常識な時間帯の繰り返し着信",
      "SMSやメールで折り返しを急かしてくる番号",
    ],
  },
];

export default function UnknownCallPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">
            知らない番号から着信があったときの対処法
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-7">
            知らない電話番号からの着信は、誰にでも起こります。慌てて折り返す前に、
            この記事の手順で「その番号が安全かどうか」を確認しましょう。
            正しく対応すれば、詐欺や迷惑電話の被害はほとんど防げます。
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {sections.map(({ heading, body, items }) => (
            <section
              key={heading}
              className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3"
            >
              <h2 className="font-bold text-gray-900">{heading}</h2>
              <p className="text-gray-700 text-sm leading-7">{body}</p>
              <ul className="flex flex-col gap-2">
                {items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700 leading-7">
                    <span className="shrink-0 text-red-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="bg-red-50 rounded-2xl border border-red-100 px-6 py-5 flex flex-col gap-2">
          <h2 className="font-bold text-gray-900">番号を調べてから判断しましょう</h2>
          <p className="text-gray-700 text-sm leading-7">
            当サイトでは、実際に着信を受けた人からの口コミをもとに、番号ごとの危険度を
            確認できます。着信のあった番号をトップページの検索ボックスから調べて、
            どんな電話なのかを確かめてから対応を判断してください。
          </p>
          <div className="flex flex-wrap gap-3 mt-1 text-sm">
            <Link href="/" className="text-red-600 underline font-bold">
              番号を検索する →
            </Link>
            <Link href="/danger-rank" className="text-gray-600 underline">
              危険度ランクの見方 →
            </Link>
          </div>
        </section>

        <p className="text-xs text-gray-400 leading-6">
          ※ 本記事は一般的な対処法をまとめたものです。実際に被害にあった、または
          不審な電話でお困りの場合は、最寄りの警察署や
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
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy-policy" className="underline">プライバシーポリシー</Link>
        </div>
      </footer>
    </div>
  );
}
