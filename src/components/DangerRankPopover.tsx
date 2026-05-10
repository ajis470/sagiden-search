"use client";

import { useState, useRef, useEffect } from "react";

const ranks = [
  { rank: "SSS", color: "bg-purple-800 text-white", label: "特殊詐欺・非常に危険" },
  { rank: "SS",  color: "bg-red-600 text-white",    label: "詐欺の前兆・要注意" },
  { rank: "S",   color: "bg-orange-500 text-white",  label: "詐欺電話の疑いあり" },
  { rank: "A",   color: "bg-yellow-500 text-gray-900", label: "悪質な迷惑電話" },
  { rank: "B",   color: "bg-blue-500 text-white",    label: "軽度の迷惑電話" },
  { rank: "C",   color: "bg-gray-400 text-white",    label: "正規・情報不足" },
];

export default function DangerRankPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-400 transition-colors"
        aria-label="危険度ランクの説明"
      >
        ?
      </button>

      {open && (
        <div className="absolute left-0 top-7 z-50 w-64 rounded-xl bg-white border border-gray-200 shadow-lg p-4 flex flex-col gap-2">
          <p className="text-xs text-gray-500 mb-1">危険度ランクの目安</p>
          {ranks.map(({ rank, color, label }) => (
            <div key={rank} className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold shrink-0 ${color}`}>
                {rank}
              </span>
              <span className="text-xs text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
