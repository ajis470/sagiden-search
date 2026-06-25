import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "みんなの迷惑電話番号データベース",
  description:
    "迷惑電話・詐欺電話の番号を検索できる口コミデータベース。番号を入力するだけで危険度ランク・みんなの口コミ・おすすめの対処法をすぐに確認できます。AIが自動で危険度を6段階判定。着信があったらすぐ調べましょう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-T48QLR1ETG" strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-T48QLR1ETG');
        `}</Script>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6107670135726196" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
