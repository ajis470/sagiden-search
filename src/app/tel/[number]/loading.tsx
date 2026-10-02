export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <span className="text-sm text-gray-500">← トップ</span>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-gray-900 text-sm">
            みんなの迷惑電話番号データベース
          </span>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-2/3 rounded bg-gray-200" />
        <div className="h-40 rounded-2xl bg-gray-100 border border-gray-200" />
        <div className="h-24 rounded-2xl bg-gray-100 border border-gray-200" />
        <p className="text-center text-sm text-gray-400">読み込み中…</p>
      </main>
    </div>
  );
}
