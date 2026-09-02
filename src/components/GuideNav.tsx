import Link from "next/link";

export const GUIDE_LINKS = [
  { href: "/guide/unknown-call", label: "知らない番号への対処法" },
  { href: "/guide/block", label: "着信拒否・ブロック方法" },
  { href: "/guide/scam-types", label: "特殊詐欺の手口と見分け方" },
  { href: "/guide/after-scammed", label: "詐欺被害に遭った時の対処法" },
  { href: "/guide/protect-elderly", label: "高齢の家族を守る方法" },
  { href: "/guide/why-spam-calls", label: "迷惑電話が増える理由" },
  { href: "/guide/number-types", label: "電話番号帯の意味と特徴" },
  { href: "/guide/caller-id-spoofing", label: "発信者番号偽装に注意" },
];

export default function GuideNav() {
  return (
    <nav className="border-t border-gray-100 bg-white overflow-x-auto">
      <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
        <span className="text-gray-400 shrink-0">📖 対処ガイド：</span>
        {GUIDE_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="hover:text-red-600 hover:underline shrink-0"
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
