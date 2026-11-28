"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Choice, Line, Script } from "@/lib/script-types";
import { canSpeak, speak, stopSpeaking } from "@/lib/speech";

type Bubble = { who: "bubbles" | "me"; line: Line };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ScriptChat({
  script,
  name,
  onExit,
}: {
  script: Script;
  name: string;
  onExit: () => void;
}) {
  const fill = useCallback(
    (line: Line): Line => ({
      en: line.en.replaceAll("{name}", name),
      ko: line.ko?.replaceAll("{name}", name),
    }),
    [name],
  );

  const [log, setLog] = useState<Bubble[]>([]);
  const [step, setStep] = useState(0);
  const [stars, setStars] = useState(0);
  const [busy, setBusy] = useState(true);
  const [done, setDone] = useState(false);
  const [showKo, setShowKo] = useState(true);
  const [sound, setSound] = useState(true);
  const soundRef = useRef(true);
  const alive = useRef(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const say = useCallback(async (who: Bubble["who"], line: Line) => {
    if (!alive.current) return;
    setLog((l) => [...l, { who, line }]);
    if (soundRef.current) await speak(line.en, who === "me" ? 0.8 : 0.85);
    else await wait(500);
  }, []);

  // 처음 시작할 때 Bubbles 의 첫 마디
  useEffect(() => {
    alive.current = true;
    (async () => {
      await say("bubbles", fill(script.steps[0].bubbles));
      if (alive.current) setBusy(false);
    })();
    return () => {
      alive.current = false;
      stopSpeaking();
    };
  }, [script, fill, say]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log, busy]);

  async function choose(choice: Choice) {
    if (busy) return;
    setBusy(true);
    setStars((s) => s + 1);
    await say("me", fill(choice.say));
    if (choice.reply) await say("bubbles", fill(choice.reply));

    const next = step + 1;
    if (next < script.steps.length) {
      await wait(300);
      await say("bubbles", fill(script.steps[next].bubbles));
      setStep(next);
      if (alive.current) setBusy(false);
    } else {
      await say("bubbles", fill(script.end));
      if (alive.current) setDone(true);
    }
  }

  function toggleSound() {
    soundRef.current = !soundRef.current;
    setSound(soundRef.current);
    if (!soundRef.current) stopSpeaking();
  }

  const choices = script.steps[step].choices;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4">
      <header className="flex items-center justify-between gap-2 py-4">
        <button onClick={onExit} className="text-sm text-zinc-500">
          ← 처음으로
        </button>
        <span className="text-sm font-semibold">
          {script.emoji} {script.title} · ⭐ {stars}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setShowKo(!showKo)}
            className="rounded-lg border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
            aria-pressed={showKo}
          >
            {showKo ? "한글 끄기" : "한글 켜기"}
          </button>
          {canSpeak() && (
            <button
              onClick={toggleSound}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
              aria-label={sound ? "소리 끄기" : "소리 켜기"}
            >
              {sound ? "🔊" : "🔇"}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {log.map((b, i) => (
          <div key={i} className={`flex ${b.who === "me" ? "justify-end" : "justify-start"}`}>
            <button
              onClick={() => speak(b.line.en)}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-left ${
                b.who === "me"
                  ? "bg-sky-500 text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
              title="눌러서 다시 듣기"
            >
              <div className="text-xl leading-snug">
                {b.who === "bubbles" && <span className="mr-1">🫧</span>}
                {b.line.en}
              </div>
              {showKo && b.line.ko && (
                <div className={`mt-1 text-sm ${b.who === "me" ? "text-sky-100" : "text-zinc-500"}`}>
                  {b.line.ko}
                </div>
              )}
            </button>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 bg-background pb-4 pt-2">
        {done ? (
          <div className="rounded-2xl bg-amber-50 p-5 text-center dark:bg-amber-950">
            <div className="text-4xl">{"⭐".repeat(Math.min(stars, 5))}</div>
            <div className="mt-2 text-lg font-bold">별 {stars}개를 모았어요!</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  stopSpeaking();
                  setLog([]);
                  setStep(0);
                  setStars(0);
                  setDone(false);
                  setBusy(true);
                  (async () => {
                    await say("bubbles", fill(script.steps[0].bubbles));
                    if (alive.current) setBusy(false);
                  })();
                }}
                className="rounded-xl border border-amber-400 py-3 font-bold"
              >
                한 번 더 🔁
              </button>
              <button onClick={onExit} className="rounded-xl bg-sky-500 py-3 font-bold text-white">
                다른 주제 🎈
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-2 text-center text-sm text-zinc-500">
              {busy ? "🫧 듣고 있어요…" : "골라서 소리 내어 말해 보세요!"}
            </p>
            <div className="space-y-2">
              {choices.map((c, i) => (
                <button
                  key={`${step}-${i}`}
                  onClick={() => choose(c)}
                  disabled={busy}
                  className="w-full rounded-2xl border-2 border-sky-400 bg-white px-4 py-3 text-left transition active:scale-[0.98] disabled:opacity-40 dark:bg-zinc-900"
                >
                  <div className="text-xl font-semibold">{fill(c.say).en}</div>
                  {showKo && c.say.ko && <div className="mt-0.5 text-sm text-zinc-500">{c.say.ko}</div>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
