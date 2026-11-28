# 🫧 우리 가족 영어 시간

가족이 각자 AI 친구 **Bubbles**와 영어로 대화하는 연습용 웹앱입니다.
기획 내용은 [docs/planning.md](docs/planning.md), 배포 방법은 [docs/deploy.md](docs/deploy.md)에 있어요.

## 처음 실행하기

1. **Node.js 설치**: https://nodejs.org 에서 LTS 버전을 설치합니다.
2. **패키지 설치**: 터미널에서 이 폴더로 이동한 뒤
   ```bash
   npm install
   ```
3. **(선택) API 키 넣기**: 저학년 대본형 대화는 키 없이 바로 쓸 수 있어요. 고학년·부모님의 AI 자유 대화를 쓸 때만 필요합니다.
   - https://platform.claude.com 에서 API 키를 발급받습니다.
   - `.env.example` 파일을 복사해서 이름을 `.env.local` 로 바꾸고, `ANTHROPIC_API_KEY=` 뒤에 키를 붙여 넣습니다.
   - `.env.local` 은 GitHub에 올라가지 않으니 안심하세요. 키는 절대 다른 파일에 적지 마세요.
4. **실행**
   ```bash
   npm run dev
   ```
   브라우저에서 http://localhost:3000 을 열면 됩니다.

## 파일 구조 (알아두면 좋은 것만)

| 파일 | 하는 일 |
|---|---|
| `scripts/kid_low/*.txt` | **저학년 대본.** 쓰는 법은 [scripts/README.md](scripts/README.md) |
| `src/components/FamilyTalk.tsx` | 시작 화면 + AI 대화 화면 |
| `src/components/ScriptChat.tsx` | 대본형 대화 화면 |
| `src/app/api/chat/route.ts` | 서버에서 Claude API를 호출하는 부분 |
| `src/lib/levels.ts` | **레벨별 AI 말투와 주제 목록.** AI 대답이 마음에 안 들면 여기를 고치면 돼요 |
| `docs/planning.md` | 기획서 |
