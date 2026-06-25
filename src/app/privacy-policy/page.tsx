import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー - みんなの迷惑電話番号データベース",
  description:
    "みんなの迷惑電話番号データベースのプライバシーポリシーです。個人情報の取り扱い、広告配信、アクセス解析ツールの使用についてご説明します。",
};

export default function PrivacyPolicyPage() {
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

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
          <p className="mt-2 text-gray-500 text-sm leading-7">
            みんなの迷惑電話番号データベース（以下「当サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
          </p>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3">
          <h2 className="font-bold text-gray-900 text-base">1. 収集する情報</h2>
          <p className="text-gray-700 text-sm leading-7">
            当サイトでは、以下の情報を収集することがあります。
          </p>
          <ul className="flex flex-col gap-1 text-sm text-gray-700 leading-7 list-disc list-inside">
            <li>コメント投稿時に入力された内容（電話番号・コメント本文・着信日時・着信種別）</li>
            <li>電話番号の検索履歴（番号のみ・個人を特定する情報は収集しません）</li>
            <li>アクセスログ（IPアドレス・ブラウザ情報・参照元URL等）</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3">
          <h2 className="font-bold text-gray-900 text-base">2. 広告配信（Google AdSense）</h2>
          <p className="text-gray-700 text-sm leading-7">
            当サイトは、Google LLC が提供する広告配信サービス「Google AdSense」を利用しています。
            Google AdSense は、ユーザーの興味・関心に基づいた広告（インタレストベース広告）を表示するために Cookie を使用します。
          </p>
          <p className="text-gray-700 text-sm leading-7">
            Cookie を無効にする方法や「広告のパーソナライズ」をオフにする方法については、
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline ml-1"
            >
              Google 広告設定ページ
            </a>
            からご確認いただけます。
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3">
          <h2 className="font-bold text-gray-900 text-base">3. アクセス解析（Google アナリティクス）</h2>
          <p className="text-gray-700 text-sm leading-7">
            当サイトは、Google LLC が提供するアクセス解析ツール「Google アナリティクス（GA4）」を利用しています。
            Google アナリティクスは Cookie を使用してアクセス情報を収集しますが、個人を特定する情報は含まれません。
          </p>
          <p className="text-gray-700 text-sm leading-7">
            収集されたデータは Google のプライバシーポリシーに基づき管理されます。
            Google アナリティクスの利用規約・プライバシーポリシーについては
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline ml-1"
            >
              Google のプライバシーポリシー
            </a>
            をご確認ください。
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3">
          <h2 className="font-bold text-gray-900 text-base">4. Cookie について</h2>
          <p className="text-gray-700 text-sm leading-7">
            当サイトおよび当サイトが利用する第三者サービスは、Cookie を使用することがあります。
            Cookie はブラウザの設定から無効にすることができますが、一部のサービスが正常に機能しなくなる場合があります。
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3">
          <h2 className="font-bold text-gray-900 text-base">5. 投稿コンテンツについて</h2>
          <p className="text-gray-700 text-sm leading-7">
            ユーザーが投稿したコメントは、当サイトのデータベースに保存され、サイト上に公開されます。
            個人情報（氏名・住所・メールアドレス等）を含む投稿はしないようお願いします。
            不適切な投稿は予告なく削除することがあります。
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3">
          <h2 className="font-bold text-gray-900 text-base">6. 免責事項</h2>
          <p className="text-gray-700 text-sm leading-7">
            当サイトに掲載されている情報はユーザーの口コミおよびAIによる自動判定に基づくものです。
            情報の正確性・完全性を保証するものではなく、当サイトの情報を利用したことによるいかなる損害についても責任を負いかねます。
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 px-6 py-5 flex flex-col gap-3">
          <h2 className="font-bold text-gray-900 text-base">7. お問い合わせ</h2>
          <p className="text-gray-700 text-sm leading-7">
            プライバシーポリシーに関するお問い合わせは、お問い合わせフォームよりご連絡ください。
          </p>
          <Link href="/contact" className="text-sm text-blue-600 underline">
            お問い合わせフォームへ
          </Link>
        </section>

        <p className="text-xs text-gray-400 leading-6">
          最終更新日：2026年6月25日
        </p>
      </main>

      <footer className="border-t border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-400">
        <p>みんなの迷惑電話番号データベース</p>
      </footer>
    </div>
  );
}
