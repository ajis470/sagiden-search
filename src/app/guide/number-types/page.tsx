import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "電話番号帯（070/080/090・0120/0800・050など）の意味と特徴 - みんなの迷惑電話番号データベース",
  description:
    "070/080/090の携帯電話、0120/0800のフリーダイヤル、050のIP電話、0570のナビダイヤル、020のM2M専用番号、固定電話の市外局番まで、電話番号の先頭部分が示す意味と特徴を総務省の公表情報にもとづいて解説します。",
};

const bands = [
  {
    range: "070 / 080 / 090",
    category: "携帯電話・PHS",
    body: "総務省が携帯電話事業者に割り当てる11桁の番号帯です。個人契約だけでなく格安SIMや法人契約でも取得できるため、発信元が個人か事業者かは番号だけでは判別できません。",
  },
  {
    range: "050",
    category: "IP電話",
    body: "インターネット回線を使ったIP電話専用の番号帯です。固定電話や携帯電話の契約なしでも比較的安価に取得できるため、コストを抑えたい事業者・個人事業主の連絡先として使われることが多くあります。",
  },
  {
    range: "0120 / 0800",
    category: "フリーダイヤル・フリーコール",
    body: "発信者ではなく着信側（企業）が通話料を負担する仕組みの番号です。0120は10桁、0800は携帯電話と同じ11桁の体系で運用されています。コールセンターや通販窓口の代表番号として広く使われています。",
  },
  {
    range: "0570",
    category: "ナビダイヤル",
    body: "NTTコミュニケーションズが提供する全国共通番号サービスです。発信者側にも通話料の一部負担が発生する場合があります。",
  },
  {
    range: "020",
    category: "M2M専用番号",
    body: "総務省が2017年に新設した、IoT機器同士の通信専用の番号帯です（0204のみポケベル等の無線呼出しサービス用）。人が会話するための電話番号としては基本的に使われません。",
  },
  {
    range: "0AB〜J（例：03 / 06 など）",
    category: "固定電話・市外局番",
    body: "「0-市外局番-市内局番-加入者番号」の形式で、市外局番はその地域に電話回線があることを示します。ただし近年はIP電話サービスの普及により、実際の所在地と市外局番が一致しないケースも増えています。",
  },
];

export default function NumberTypesPage() {
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
            電話番号帯の意味と特徴（070/080/090・0120/0800・050など）
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-7">
            電話番号の先頭数桁には、それぞれ総務省が定めた用途があります。
            仕組みを知っておくと、かかってきた電話がどんな性質のものか判断する手がかりになります。
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {bands.map(({ range, category, body }) => (
            <section
              key={range}
              className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-2"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-gray-800 text-white">
                  {range}
                </span>
                <h2 className="font-bold text-gray-900">{category}</h2>
              </div>
              <p className="text-gray-700 text-sm leading-7">{body}</p>
            </section>
          ))}
        </div>

        <section className="bg-red-50 rounded-2xl border border-red-100 px-6 py-5 flex flex-col gap-2">
          <h2 className="font-bold text-gray-900">かかってきた番号を確認する</h2>
          <p className="text-gray-700 text-sm leading-7">
            番号帯の種類だけでは安全性は判断できません。実際にどんな内容の電話だったか、
            当サイトで番号を検索して口コミを確認してみてください。
          </p>
          <div className="flex flex-wrap gap-3 mt-1 text-sm">
            <Link href="/" className="text-red-600 underline font-bold">
              番号を検索する →
            </Link>
            <Link href="/guide/caller-id-spoofing" className="text-gray-600 underline">
              発信者番号偽装（なりすまし）に注意 →
            </Link>
          </div>
        </section>

        <p className="text-xs text-gray-400 leading-6">
          ※ 各番号帯の用途は、
          <a
            href="https://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline mx-1"
          >
            総務省「電気通信番号制度」
          </a>
          の公表情報にもとづいています。
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
