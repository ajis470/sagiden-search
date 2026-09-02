import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "発信者番号偽装（スプーフィング）に注意 - 下4桁0110の警察詐欺の手口 - みんなの迷惑電話番号データベース",
  description:
    "着信画面に表示される発信者番号は、専用の技術やアプリで自由に書き換えられる場合があります。実在する警察署の代表番号（下4桁0110）を装って着信させる特殊詐欺が全国で急増しており、国民生活センターや警視庁が注意を呼びかけています。仕組みと対処法を解説します。",
};

const sections: {
  heading: string;
  body: string;
  items?: string[];
}[] = [
  {
    heading: "発信者番号偽装（スプーフィング）とは",
    body: "着信画面に表示される発信者番号は、実は発信者側で自由に書き換えられる場合があります。海外のIP電話サービスなど発信者番号を任意に設定できる仕組みを悪用し、実在する番号になりすまして着信させることが技術的に可能です。",
  },
  {
    heading: "実例：下4桁「0110」の警察詐欺",
    body: "多くの警察署は代表電話の下4桁に「0110」を使っています。この特徴を悪用し、実在する警察署の番号を発信者番号偽装で表示させて着信させる特殊詐欺が2024年以降、全国で急増しています。",
    items: [
      "着信画面に実在する警察署の代表番号（下4桁0110）が表示される",
      "電話の途中でLINEのビデオ通話に誘導され、偽の警察手帳や逮捕状を見せられる",
      "「捜査に協力してほしい」「口座を確認する必要がある」などと言われ、個人情報の聞き出しや金銭の振り込みを要求される",
    ],
  },
  {
    heading: "警察が絶対にしないこと",
    body: "国民生活センター・警視庁は、以下のような対応を警察が行うことはないと注意を呼びかけています。",
    items: [
      "LINEのトークやビデオ通話で連絡してくること",
      "個人名義の口座へ振り込ませること",
      "電話だけで、逮捕状や捜査協力を理由に金銭を要求すること",
    ],
  },
  {
    heading: "対処法",
    body: "発信者番号の表示だけでは、相手が本物かどうかを判断できません。次の点を意識してください。",
    items: [
      "表示された番号を鵜呑みにせず、内容が不審であればいったん電話を切る",
      "確認のために折り返す場合は、表示された番号ではなく公式サイトなどで確認した番号にかけ直す",
      "少しでも不安を感じたら、警察相談専用電話「＃9110」や家族に相談してから対応する",
    ],
  },
];

export default function CallerIdSpoofingPage() {
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
            発信者番号偽装（スプーフィング）に注意 - 下4桁0110の警察詐欺
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-7">
            着信画面の番号表示は、必ずしも「本当にその番号からかかってきた」ことを意味しません。
            実在する番号になりすます手口と、その代表例を知っておきましょう。
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
              {items && (
                <ul className="flex flex-col gap-2">
                  {items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700 leading-7">
                      <span className="shrink-0 text-red-500 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <section className="bg-red-50 rounded-2xl border border-red-100 px-6 py-5 flex flex-col gap-2">
          <h2 className="font-bold text-gray-900">かかってきた番号を確認する</h2>
          <p className="text-gray-700 text-sm leading-7">
            同じ手口が他の人にも報告されていることがあります。
            着信のあった番号を当サイトで検索し、口コミと危険度を確認してから対応しましょう。
          </p>
          <div className="flex flex-wrap gap-3 mt-1 text-sm">
            <Link href="/" className="text-red-600 underline font-bold">
              番号を検索する →
            </Link>
            <Link href="/guide/scam-types" className="text-gray-600 underline">
              特殊詐欺の主な手口と見分け方 →
            </Link>
            <Link href="/guide/number-types" className="text-gray-600 underline">
              電話番号帯の意味と特徴 →
            </Link>
          </div>
        </section>

        <p className="text-xs text-gray-400 leading-6">
          ※ 出典：
          <a
            href="https://www.kokusen.go.jp/news/data/n-20250423_2.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline mx-1"
          >
            国民生活センター
          </a>
          /
          <a
            href="https://www.keishicho.metro.tokyo.lg.jp/kurashi/tokushu/police_officer.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline mx-1"
          >
            警視庁「警察官等をかたる詐欺」
          </a>
          。詐欺被害にあった、またはあいそうになった場合は、警察相談専用電話「＃9110」や最寄りの警察署にすぐご相談ください。
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
