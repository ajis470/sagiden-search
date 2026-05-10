"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = value.replace(/[^\d]/g, "");
    if (normalized.length < 10) return;
    router.push(`/tel/${normalized}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="flex gap-2">
        <input
          type="tel"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="例：0120123456"
          className="flex-1 rounded-xl border-2 border-gray-300 px-5 py-4 text-xl focus:border-red-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl bg-red-600 px-6 py-4 text-lg font-bold text-white hover:bg-red-700 active:bg-red-800"
        >
          調べる
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500 text-center">
        ハイフンあり・なしどちらでも入力できます
      </p>
    </form>
  );
}
