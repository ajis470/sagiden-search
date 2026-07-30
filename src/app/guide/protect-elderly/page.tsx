import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "高齢の家族をオレオレ詐欺・特殊詐欺から守る方法 - みんなの迷惑電話番号データベース",
  description:
    "オレオレ詐欺・還付金詐欺は今も高齢者が中心的なターゲットです。離れて暮らす家族ができる予防策、日頃の見守りポイント、万が一のときの動き方をまとめました。",
};

const sections = [
  {
    heading: "なぜ高齢者が狙われやすいのか",
    body: "特殊詐欺のグループは、次のような理由から高齢者宅への電話を優先して狙う傾向があります。",
    items: [
      "日中在宅していることが多く、電話に出てもらいやすい",
      "子や孫を名乗る手口に対して、心配のあまり冷静な判断がしづらい",
      "銀行やATM操作に不慣れで、犯人の誘導に従いやすい場面がある",
      "一定の金融資産を持っている世帯が多い",
    ],
  },
  {
    heading: "家族でできる予防策",
    body: "電話がかかってくる前に、家族間でルールを決めておくことが最も効果的な対策です。",
    items: [
      "家族だけの合言葉を決めておき、お金の話が出たら必ず合言葉を確認する",
      "留守番電話設定にして、知らない番号にはすぐ出ないようにしてもらう",
      "非通知・公衆電話からの着信を拒否する設定にする（多くの詐欺は番号を隠して発信する）",
      "「お金の話は必ず一度電話を切って、家族に確認してから」を徹底してもらう",
    ],
  },
  {
    heading: "日頃の見守りポイント",
    body: "詐欺の兆候は、電話の内容だけでなく普段の様子の変化にも表れます。離れて暮らしている場合は、次のような変化がないか気にかけてください。",
    items: [
      "急にATMや銀行の話をするようになった",
      "「誰にも言わないで」と口止めされている様子がある",
      "普段と違う時間帯に外出しようとする",
      "知らない人からの荷物や郵便物が増えた",
    ],
  },
  {
    heading: "もし家族が振り込んでしまったら",
    body: "起きてしまった後は、責めるよりもスピードが大切です。落ち着いて次の行動を一緒に取ってください。",
    items: [
      "振込先の金融機関にすぐ連絡し、口座凍結を依頼する",
      "警察（110番、または警察相談専用電話 #9110）に相談する",
      "同じ手口が繰り返されないよう、以後の対応を家族間で再確認する",
    ],
  },
];

export default function ProtectElderlyPage() {
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
            高齢の家族をオレオレ詐欺・特殊詐欺から守る方法
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-7">
            特殊詐欺の被害額・件数は今も高齢者世帯に集中しています。
            本人の注意力だけに頼らず、家族があらかじめ「仕組み」で防ぐことが被害防止の近道です。
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
          <h2 className="font-bold text-gray-900">かかってきた番号を一緒に調べる</h2>
          <p className="text-gray-700 text-sm leading-7">
            親御さんに不審な電話があったら、番号を聞いて当サイトで検索してみてください。
            すでに同じ番号への注意喚起が投稿されている場合があります。
          </p>
          <div className="flex flex-wrap gap-3 mt-1 text-sm">
            <Link href="/" className="text-red-600 underline font-bold">
              番号を検索する →
            </Link>
            <Link href="/guide/after-scammed" className="text-gray-600 underline">
              被害に遭った場合の対処法 →
            </Link>
          </div>
        </section>

        <p className="text-xs text-gray-400 leading-6">
          ※ 本記事は一般的な予防策をまとめたものです。緊急の場合は110番、
          判断に迷う場合は
          <a
            href="https://www.npa.go.jp/bureau/safetylife/sos47/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1"
          >
            警察相談専用電話 #9110
          </a>
          をご利用ください。
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
