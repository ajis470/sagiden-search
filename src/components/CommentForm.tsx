"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Props = {
  number: string;
};

export default function CommentForm({ number }: Props) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "done_published" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertDateTime() {
    const now = new Date();
    const text = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}着信\n`;
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const newBody = body.slice(0, start) + text + body.slice(end);
    setBody(newBody);
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + text.length;
      el.focus();
    }, 0);
  }

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
      const json = await res.json().catch(() => ({}));
      setStatus(json.status_moderation === "published" ? "done_published" : "done");
      setBody("");
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setErrorMsg(json.message ?? "送信に失敗しました。もう一度お試しください。");
      setStatus("error");
    }
  }

  if (status === "done_published") {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-green-800">
        投稿が掲載されました。ありがとうございます。
      </div>
    );
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
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="できるだけわかりやすく書いていただけると、みんなの役に立ちます。"
          rows={4}
          className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-base focus:border-red-500 focus:outline-none resize-none"
        />
        <button
          type="button"
          onClick={insertDateTime}
          className="absolute bottom-2 right-2 rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-500 hover:bg-gray-200"
        >
          着信日時を挿入
        </button>
      </div>
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
