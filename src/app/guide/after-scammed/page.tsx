import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "詐欺被害に遭ってしまった時の対処法・相談窓口まとめ - みんなの迷惑電話番号データベース",
  description:
    "電話やSMSで詐欺被害に遭ってしまった場合の初動対応と、公的な相談窓口をまとめました。お金を振り込んでしまった、カード情報を伝えてしまった、個人情報を話してしまっただけ、それぞれのケース別に今すぐできることを解説します。",
};

const sections = [
  {
    heading: "まず落ち着いて記録すること",
    body: "被害に気づいたら、まず次の情報をメモに残してください。後で警察や相談窓口に伝える際、対応のスピードが大きく変わります。",
    items: [
      "相手の電話番号・名乗った会社名や氏名",
      "電話やSMSがあった日時",
      "何を話した・何を伝えてしまったか（金額、口座番号、カード番号など）",
      "振り込んだ場合は、振込先の金融機関名・支店名・口座番号",
    ],
  },
  {
    heading: "お金を振り込んでしまった場合",
    body: "一刻を争います。次の順番で、できるだけ早く連絡してください。",
    items: [
      "振込先の金融機関（コールセンターまたは窓口）に連絡し、振込先口座の凍結を依頼する",
      "警察（110番、または最寄りの警察署の生活安全課）に被害を届け出る",
      "「振り込め詐欺救済法」により、凍結された口座に残った資金の一部が被害者に分配される制度がある。手続きは金融機関からの案内に従う",
    ],
  },
  {
    heading: "クレジットカード情報を伝えてしまった場合",
    body: "カード会社への連絡が最優先です。不正利用される前に止められる可能性があります。",
    items: [
      "カード裏面またはカード会社アプリに記載の緊急連絡先にすぐ電話し、利用停止・再発行を依頼する",
      "身に覚えのない請求がないか、しばらく利用明細をこまめに確認する",
      "同じID・パスワードを他のサービスで使い回している場合は、それらも変更する",
    ],
  },
  {
    heading: "個人情報を話してしまっただけの場合",
    body: "お金の被害が今のところ無くても油断は禁物です。伝えた情報をもとに、別の手口で再度狙われることがあります。",
    items: [
      "同じ番号・関係者からの着信は着信拒否設定にする",
      "「先ほどの件で」など、話した内容を利用してくる二次被害の電話に注意する",
      "家族構成や資産状況を話してしまった場合は、家族にも情報共有しておく",
    ],
  },
];

const contacts = [
  { name: "消費者ホットライン", number: "188（いやや！）", desc: "契約トラブル・詐欺全般の相談。最寄りの消費生活センターにつながる" },
  { name: "警察相談専用電話", number: "#9110", desc: "犯罪かどうか判断に迷う場合の相談窓口。緊急時は110番" },
  { name: "国民生活センター", number: "-", desc: "消費者トラブルの情報提供・あっせん。ウェブサイトでも事例検索可能" },
];

export default function AfterScammedPage() {
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
            詐欺被害に遭ってしまった時の対処法・相談窓口まとめ
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-7">
            「騙されたかもしれない」と気づいた時点で、対応が早いほど被害を最小限にできます。
            自分を責める前に、まずはこのページの手順に沿って動いてください。
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

        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3">
          <h2 className="font-bold text-gray-900">主な公的相談窓口</h2>
          <ul className="flex flex-col gap-3">
            {contacts.map(({ name, number, desc }) => (
              <li key={name} className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-gray-900">
                  {name}
                  {number !== "-" && <span className="ml-2 text-red-600">{number}</span>}
                </span>
                <span className="text-xs text-gray-500 leading-6">{desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-red-50 rounded-2xl border border-red-100 px-6 py-5 flex flex-col gap-2">
          <h2 className="font-bold text-gray-900">同じ番号からまた着信があったら</h2>
          <p className="text-gray-700 text-sm leading-7">
            一度狙われた番号は、その後も繰り返し接触を試みてくることがあります。
            当サイトで番号を検索し、他の人も同じ被害に遭っていないか確認してみてください。
          </p>
          <div className="flex flex-wrap gap-3 mt-1 text-sm">
            <Link href="/" className="text-red-600 underline font-bold">
              番号を検索する →
            </Link>
            <Link href="/guide/scam-types" className="text-gray-600 underline">
              特殊詐欺の手口と見分け方 →
            </Link>
          </div>
        </section>

        <p className="text-xs text-gray-400 leading-6">
          ※ 本記事は一般的な対応をまとめたものです。個別の状況については、
          <a
            href="https://www.npa.go.jp/bureau/safetylife/sos47/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1"
          >
            警察庁の相談窓口
          </a>
          や金融機関、消費生活センターに直接ご相談ください。
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
