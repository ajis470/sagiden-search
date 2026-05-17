import type { DangerRank } from "@/lib/api";

const styles: Record<DangerRank, string> = {
  C: "bg-gray-400 text-white",
  B: "bg-blue-500 text-white",
  A: "bg-yellow-500 text-gray-900",
  S: "bg-orange-500 text-white",
  SS: "bg-red-600 text-white",
  SSS: "bg-purple-800 text-white",
};

const labels: Record<DangerRank, string> = {
  C: "正規・情報不足",
  B: "軽度の迷惑電話",
  A: "悪質な迷惑電話",
  S: "詐欺電話の疑いあり",
  SS: "詐欺の前兆・要注意",
  SSS: "特殊詐欺・非常に危険",
};

type Props = {
  rank: DangerRank | null;
  showLabel?: boolean;
  showPrefix?: boolean;
};

export default function DangerBadge({ rank, showLabel = false, showPrefix = false }: Props) {
  if (!rank) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm font-bold text-gray-600">
        判定中
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      {showPrefix && (
        <span className="text-sm text-gray-500">危険度：</span>
      )}
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${styles[rank]}`}
      >
        {rank}
      </span>
      {showLabel && (
        <span className="text-sm text-gray-600">{labels[rank]}</span>
      )}
    </span>
  );
}
