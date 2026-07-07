import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "迷惑電話・詐欺電話をブロックする方法【iPhone・Android・固定電話・キャリア別】 - みんなの迷惑電話番号データベース",
  description:
    "迷惑電話や詐欺電話を着信拒否・ブロックする方法を、iPhone・Android・固定電話・大手キャリア（ドコモ・au・ソフトバンク）別にわかりやすくまとめました。特定の番号を拒否する手順から、非通知・国際電話をまとめて防ぐ方法まで解説します。",
};

const blocks = [
  {
    title: "iPhone（iOS）で着信拒否する",
    steps: [
      "「電話」アプリを開き、「履歴」で拒否したい番号をタップ",
      "番号の右にある「i」（詳細）をタップ",
      "画面下の「この発信者を着信拒否」を選ぶ",
      "登録していない番号をまとめて消音したい場合は、「設定」→「電話」→「不明な発信者を消音」をオンにする（連絡先にない番号は着信音が鳴らず留守電へ回ります）",
    ],
  },
  {
    title: "Android で着信拒否する",
    note: "機種やバージョンによって表記が異なります。ここではおおまかな共通手順です。",
    steps: [
      "「電話」アプリの「履歴」から拒否したい番号を長押し、またはタップ",
      "「ブロック」または「着信拒否設定に追加」を選ぶ",
      "「メニュー（︙）」→「設定」→「ブロック中の電話番号」から、非通知の着信をまとめて拒否することも可能",
    ],
  },
  {
    title: "固定電話で迷惑電話を防ぐ",
    steps: [
      "電話機本体の「迷惑電話防止機能」を使う（着信時に警告メッセージを流す、通話を自動録音するなど）",
      "ナンバー・ディスプレイ契約で番号を表示させ、非通知はあらかじめ拒否する設定にする",
      "NTTの「ナンバー・リクエスト」を使うと、非通知の相手に「番号を通知してかけ直すよう」自動アナウンスできる",
    ],
  },
];

const carriers = [
  {
    name: "ドコモ（docomo）",
    desc: "「迷惑電話ストップサービス」を無料で利用できます。迷惑電話を受けた直後に特定の操作をすると、その番号からの着信を自動で拒否できます。",
  },
  {
    name: "au",
    desc: "「迷惑電話撃退サービス」（有料）や、迷惑電話の可能性を画面に表示する「迷惑電話フィルター」系のアプリが利用できます。番号ごとの拒否登録に対応しています。",
  },
  {
    name: "ソフトバンク（SoftBank）",
    desc: "「ナンバーブロック」（有料）で、指定した番号や直前にかかってきた番号を拒否できます。拒否した相手にはガイダンスが流れます。",
  },
];

export default function BlockPage() {
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
            迷惑電話・詐欺電話をブロックする方法
          </h1>
          <p className="mt-2 text-gray-500 text-sm leading-7">
            しつこい迷惑電話や詐欺電話は、着信拒否の設定で防げます。
            お使いの端末やキャリアに合わせて、特定の番号を拒否する手順をまとめました。
            まずは番号を調べ、危険な相手だと分かったらブロックしておきましょう。
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {blocks.map(({ title, note, steps }) => (
            <section
              key={title}
              className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3"
            >
              <h2 className="font-bold text-gray-900">{title}</h2>
              {note && <p className="text-gray-500 text-xs leading-6">{note}</p>}
              <ol className="flex flex-col gap-2">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700 leading-7">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-xs">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3">
          <h2 className="font-bold text-gray-900">大手キャリアの拒否サービス</h2>
          <p className="text-gray-500 text-xs leading-6">
            ※ サービス内容・料金は変更される場合があります。最新の内容は各キャリアの
            公式サイトでご確認ください。
          </p>
          <div className="flex flex-col gap-3">
            {carriers.map(({ name, desc }) => (
              <div key={name} className="flex flex-col gap-1">
                <span className="font-bold text-gray-900 text-sm">{name}</span>
                <p className="text-gray-700 text-sm leading-7">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-red-50 rounded-2xl border border-red-100 px-6 py-5 flex flex-col gap-2">
          <h2 className="font-bold text-gray-900">拒否する前に、まず番号を調べる</h2>
          <p className="text-gray-700 text-sm leading-7">
            ブロックする前に、その番号が本当に迷惑電話なのかを確認しておくと安心です。
            当サイトで番号を検索すると、実際に着信を受けた人の口コミと危険度を確認できます。
          </p>
          <div className="flex flex-wrap gap-3 mt-1 text-sm">
            <Link href="/" className="text-red-600 underline font-bold">
              番号を検索する →
            </Link>
            <Link href="/guide/unknown-call" className="text-gray-600 underline">
              知らない番号への対処法 →
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
