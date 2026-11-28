// 브라우저 내장 음성 기능으로 영어 문장을 읽어줘요. (무료, 설치 불필요)

let voice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (voice !== undefined && voice !== null) return voice;
  const voices = window.speechSynthesis.getVoices();
  voice =
    voices.find((v) => v.lang === "en-US" && /female|samantha|google us/i.test(v.name)) ??
    voices.find((v) => v.lang === "en-US") ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null;
  return voice;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

/** 문장을 읽고, 다 읽으면 끝나는 Promise. 음성이 안 되는 기기에서도 멈추지 않도록 시간 제한을 둬요. */
export function speak(text: string, rate = 0.85): Promise<void> {
  const clean = text.replace(/\p{Extended_Pictographic}/gu, "").trim();
  if (!canSpeak() || !clean) return Promise.resolve();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "en-US";
    u.rate = rate;
    const v = pickVoice();
    if (v) u.voice = v;
    u.onend = finish;
    u.onerror = finish;
    window.speechSynthesis.speak(u);
    setTimeout(finish, 1500 + clean.length * 120);
  });
}
