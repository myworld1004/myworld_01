import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, isLevelId, TOPICS } from "@/lib/levels";

// API 키는 서버에서만 읽습니다 (.env.local 의 ANTHROPIC_API_KEY). 브라우저로는 절대 보내지 않아요.
const client = new Anthropic();

// 사용할 모델. .env.local 의 CLAUDE_MODEL 로 바꿀 수 있어요 (예: 더 저렴한 claude-haiku-5-5).
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

// 비용이 갑자기 늘지 않도록 대화 길이와 메시지 길이를 제한합니다.
const MAX_TURNS = 40;
const MAX_CHARS = 500;

type ChatTurn = { role: "user" | "assistant"; content: string };

function parseMessages(value: unknown): ChatTurn[] | null {
  if (!Array.isArray(value) || value.length > MAX_TURNS) return null;
  const out: ChatTurn[] = [];
  for (const m of value) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      m.content.length > MAX_CHARS
    ) {
      return null;
    }
    out.push({ role: m.role, content: m.content });
  }
  return out;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "AI API 키가 아직 설정되지 않았어요. .env.local 파일에 ANTHROPIC_API_KEY 를 넣어 주세요." },
      { status: 500 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const { level, topic, name } = body;
  const history = parseMessages(body.messages);
  if (!isLevelId(level) || typeof topic !== "string" || !TOPICS.some((t) => t.id === topic) || !history) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }
  const learnerName = typeof name === "string" && name.trim() ? name.trim().slice(0, 20) : "friend";

  // 대화의 첫 메시지는 항상 user 여야 해서, 시작할 때는 신호용 메시지를 넣어요.
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: "(The learner just opened the app. Start the conversation.)" },
    ...history,
  ];

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: buildSystemPrompt(level, topic, learnerName),
      messages,
      // 일상 대화라 깊게 생각할 필요가 없어서 low 로 빠르고 저렴하게.
      output_config: { effort: "low" },
      // 드물게 안전 필터가 응답을 거절하면, 서버가 다른 모델로 자동 재시도해요.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (response.stop_reason === "refusal") {
      return Response.json({ reply: "Hmm, let's talk about something else! What's your favorite color?" });
    }

    const reply = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    return Response.json({ reply: reply || "Sorry, can you say that again?" });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "API 키가 올바르지 않아요. .env.local 을 확인해 주세요." }, { status: 500 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "요청이 너무 많아요. 잠시 후 다시 시도해 주세요." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}:`, error.message);
      return Response.json({ error: "AI 서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요." }, { status: 502 });
    }
    if (error instanceof Anthropic.AnthropicError) {
      console.error("Claude client error:", error.message);
      return Response.json({ error: "AI에 연결하지 못했어요. API 키 설정을 확인해 주세요." }, { status: 500 });
    }
    console.error("Unexpected error:", error);
    return Response.json({ error: "알 수 없는 문제가 생겼어요." }, { status: 500 });
  }
}
