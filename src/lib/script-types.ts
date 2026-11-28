// 대본 데이터 구조 (브라우저와 서버 양쪽에서 사용)

export type Line = { en: string; ko?: string };

export type Choice = { say: Line; reply?: Line };

export type Step = { bubbles: Line; choices: Choice[] };

export type Script = {
  id: string;
  title: string;
  emoji: string;
  steps: Step[];
  end: Line;
};
