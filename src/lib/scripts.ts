// scripts/ 폴더의 대본 텍스트 파일을 읽어서 화면에서 쓸 수 있는 데이터로 바꿔요. (서버 전용)
import fs from "node:fs";
import path from "node:path";
import type { Choice, Line, Script, Step } from "./script-types";

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");

function parseLine(text: string): Line {
  const [en, ko] = text.split("|").map((s) => s.trim());
  return ko ? { en, ko } : { en };
}

export function parseScript(id: string, source: string): Script {
  const fail = (lineNo: number, msg: string): never => {
    throw new Error(`대본 "${id}" ${lineNo}번째 줄: ${msg}`);
  };

  let title = "";
  let emoji = "💬";
  let end: Line | null = null;
  const steps: Step[] = [];
  let current: Step | null = null;

  source.split(/\r?\n/).forEach((raw, i) => {
    const lineNo = i + 1;
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;

    if (line.startsWith("title:")) {
      title = line.slice(6).trim();
    } else if (line.startsWith("emoji:")) {
      emoji = line.slice(6).trim();
    } else if (line.startsWith("end:")) {
      end = parseLine(line.slice(4));
    } else if (line.startsWith("Bubbles:")) {
      if (current && current.choices.length === 0) fail(lineNo, "앞 장면에 보기(*)가 하나도 없어요.");
      current = { bubbles: parseLine(line.slice(8)), choices: [] };
      steps.push(current);
    } else if (line.startsWith("*")) {
      if (!current) fail(lineNo, "보기(*) 앞에 'Bubbles:' 줄이 먼저 있어야 해요.");
      const [say, reply] = line.slice(1).split("=>");
      const choice: Choice = { say: parseLine(say) };
      if (reply?.trim()) choice.reply = parseLine(reply);
      if (!choice.say.en) fail(lineNo, "보기 문장이 비어 있어요.");
      current!.choices.push(choice);
    } else {
      fail(lineNo, `알 수 없는 줄이에요: "${line}" (Bubbles:, *, title:, emoji:, end: 중 하나로 시작해야 해요)`);
    }
  });

  if (!title) fail(1, "'title:' 줄이 없어요.");
  if (steps.length === 0) fail(1, "'Bubbles:' 장면이 하나도 없어요.");
  if (steps[steps.length - 1].choices.length === 0) fail(1, "마지막 장면에 보기(*)가 없어요.");

  return { id, title, emoji, steps, end: end ?? { en: "Great job, {name}!" } };
}

export function loadScripts(level: string): Script[] {
  const dir = path.join(SCRIPTS_DIR, level);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".txt"))
    .sort()
    .map((f) => parseScript(`${level}/${f}`, fs.readFileSync(path.join(dir, f), "utf8")));
}
