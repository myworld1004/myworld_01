# Vercel 배포 안내

## 준비: 코드를 main 브랜치에 합치기
Vercel은 GitHub 레포의 **main 브랜치**를 실제 앱 주소로 배포합니다. 작업 브랜치의 내용을 main에 먼저 합쳐 주세요(Pull Request 생성 후 Merge).

## 1. Vercel 가입
1. https://vercel.com 접속 → **Sign Up**
2. 플랜은 **Hobby**(무료, 개인용) 선택
3. **Continue with GitHub**로 가입

## 2. 레포 연결
1. 대시보드에서 **Add New… → Project**
2. GitHub 권한 요청이 나오면 **Only select repositories**로 `myworld_01`만 허용
3. 목록에서 `myworld_01` 옆 **Import**

## 3. 설정 확인 후 배포
- Framework Preset: **Next.js** (자동 인식)
- Root Directory: `./` 그대로
- Environment Variables: **지금은 비워두기** (저학년 대본형은 키 없이 동작)
- **Deploy** 클릭 → 1~2분 뒤 `https://<프로젝트이름>.vercel.app` 주소가 생김

## 4. 폰에 설치
- **안드로이드(크롬):** 주소 열기 → 메뉴(⋮) → **앱 설치** 또는 **홈 화면에 추가**
- **아이폰(사파리):** 주소 열기 → 공유 버튼 → **홈 화면에 추가**

## 이후 업데이트
main 브랜치에 새 코드가 합쳐지면 Vercel이 **자동으로 다시 배포**합니다. 따로 할 일이 없어요.

## 나중에 AI 대화를 켤 때
Vercel 프로젝트 → **Settings → Environment Variables**에서
- `ANTHROPIC_API_KEY` = 발급받은 키
- (선택) `CLAUDE_MODEL` = `claude-haiku-5-5`

저장한 뒤 **Deployments → 최신 배포 → Redeploy**를 누르면 적용됩니다.
