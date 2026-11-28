"use client";

import { useEffect, useRef, useState } from "react";
import { LEVELS, TOPICS, type LevelId } from "@/lib/levels";

type ChatTurn = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<LevelId>("kid_low");
  const [topic, setTopic] = useState(TOPICS[0].id);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function ask(history: ChatTurn[]) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, topic, name, messages: history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "문제가 생겼어요.");
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "문제가 생겼어요.");
    } finally {
      setLoading(false);
    }
  }

  function start() {
    setStarted(true);
    setMessages([]);
    ask([]);
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const history: ChatTurn[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    ask(history);
  }

  const isKid = level !== "adult";

  if (!started) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
        <h1 className="text-2xl font-bold">🫧 우리 가족 영어 시간</h1>
        <p className="mt-1 text-sm text-zinc-500">AI 친구 Bubbles와 영어로 이야기해요</p>

        <label className="mt-8 block text-sm font-semibold">이름 (별명)</label>
        <input
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="예: Minji, Dad"
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <p className="mt-6 text-sm font-semibold">누가 할까요?</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {Object.values(LEVELS).map((l) => (
            <button
              key={l.id}
              onClick={() => setLevel(l.id)}
              className={`rounded-xl border p-3 text-center ${
                level === l.id
                  ? "border-sky-500 bg-sky-50 dark:bg-sky-950"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <div className="text-2xl">{l.emoji}</div>
              <div className="mt-1 text-sm font-semibold">{l.label}</div>
              <div className="mt-1 text-xs text-zinc-500">{l.description}</div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm font-semibold">오늘의 주제</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTopic(t.id)}
              className={`rounded-xl border p-3 text-sm ${
                topic === t.id
                  ? "border-sky-500 bg-sky-50 dark:bg-sky-950"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={start}
          className="mt-8 w-full rounded-xl bg-sky-500 py-4 text-lg font-bold text-white active:bg-sky-600"
        >
          시작하기 🚀
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4">
      <header className="flex items-center justify-between py-4">
        <button onClick={() => setStarted(false)} className="text-sm text-zinc-500">
          ← 처음으로
        </button>
        <span className="text-sm font-semibold">
          {LEVELS[level].emoji} {name || "friend"} · {TOPICS.find((t) => t.id === topic)?.label}
        </span>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 ${
                isKid ? "text-lg" : "text-base"
              } ${
                m.role === "user"
                  ? "bg-sky-500 text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {m.role === "assistant" && <span className="mr-1">🫧</span>}
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-zinc-400">🫧 생각 중…</div>}
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="sticky bottom-0 flex gap-2 bg-background py-3">
        <input
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base dark:border-zinc-700 dark:bg-zinc-900"
          placeholder="영어로 대답해 보세요"
          maxLength={500}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 whitespace-nowrap rounded-xl bg-sky-500 px-5 font-bold text-white disabled:opacity-40"
        >
          보내기
        </button>
      </form>
    </main>
  );
}
