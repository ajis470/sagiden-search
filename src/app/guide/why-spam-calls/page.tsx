import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "迷惑電話・知らない番号からの着信が増える理由 - みんなの迷惑電話番号データベース",
  description:
    "登録した覚えのない番号から着信が増えたと感じたら、それには理由があります。電話番号の主な漏洩経路と、業者側がどうやって発信先を決めているのかを解説します。",
};

const sections = [
  {
    heading: "電話番号はどこから漏れるのか",
    body: "「誰にも教えていないのに」と感じても、次のような経路で番号が第三者の手に渡っていることがあります。",
    items: [
      "懸賞・アンケート・無料プレゼント応募時に入力した番号が、名簿として販売される",
      "通販・不動産・保険など各種申し込み時の情報が、提携先や名簿業者に流れる",
      "スマホアプリに連絡先アクセスを許可したことで、自分の番号が別の経路で収集される",
      "過去に流出した名簿・データベースが、闇市場で繰り返し売買されている",
    ],
  },
  {
    heading: "業者はどうやって発信先を決めているのか",
    body: "個人を特定して狙っているとは限りません。効率重視で機械的に発信しているケースも多くあります。",
    items: [
      "既存の名簿に載っている番号へ順番に自動発信する",
      "実在しそうな番号を連番で総当たり発信し、応答があった番号だけを「生きている番号」として記録する",
      "一度応答・折り返しをした番号は「反応する番号」として、その後も繰り返し狙われやすくなる",
    ],
  },
  {
    heading: "自分の番号が出回っているかもしれないサイン",
    body: "次のような着信が増えてきたら、番号が何らかの名簿に載っている可能性があります。",
    items: [
      "身に覚えのない不動産・投資・保険の営業電話が増えた",
      "同じような内容の電話が、違う番号から繰り返しかかってくる",
      "一度も応答していないのに、SMSで不審なリンクが届くようになった",
    ],
  },
  {
    heading: "これ以上増やさないためにできること",
    body: "完全に防ぐことは難しいですが、新たな漏洩を減らすことはできます。",
    items: [
      "懸賞・アンケートに電話番号を入力する際は、本当に必要かを一度考える",
      "スマホアプリの「連絡先へのアクセス」権限は、必要なものだけ許可する",
      "不審な着信には折り返さない・反応しない（「反応する番号」と認識されないようにする）",
    ],
  },
];

export default function WhySpamCallsPage() {
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
            迷惑電話・知らない番号からの着信が増える理由
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-7">
            「最近知らない番号からの電話が増えた」と感じたら、それは気のせいではなく、
            番号がどこかで名簿に載ってしまっている可能性があります。仕組みを知ることが対策の第一歩です。
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
          <h2 className="font-bold text-gray-900">かかってきた番号を確認する</h2>
          <p className="text-gray-700 text-sm leading-7">
            同じ名簿が使われている場合、他の人にも同じ番号から着信があるはずです。
            当サイトで番号を検索して、どんな電話なのかをまず確認してみてください。
          </p>
          <div className="flex flex-wrap gap-3 mt-1 text-sm">
            <Link href="/" className="text-red-600 underline font-bold">
              番号を検索する →
            </Link>
            <Link href="/guide/block" className="text-gray-600 underline">
              着信拒否・ブロック方法 →
            </Link>
          </div>
        </section>
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
