"use client";

import { useState } from "react";

type Props = {
  number: string;
};

export default function CommentForm({ number }: Props) {
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setStatus("sending");

    const res = await fetch("/api/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number, body }),
    });

    if (res.ok) {
      setStatus("done");
      setBody("");
    } else {
      const json = await res.json().catch(() => ({}));
      setErrorMsg(json.message ?? "送信に失敗しました。もう一度お試しください。");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-green-800">
        投稿を受け付けました。確認後に掲載されます。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="できるだけわかりやすく書いていただけると、みんなの役に立ちます。"
        rows={4}
        className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base focus:border-red-500 focus:outline-none resize-none"
      />
      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending" || !body.trim()}
        className="self-end rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 disabled:opacity-40"
      >
        {status === "sending" ? "送信中..." : "投稿する"}
      </button>
    </form>
  );
}
