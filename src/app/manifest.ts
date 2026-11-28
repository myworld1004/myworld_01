import type { MetadataRoute } from "next";

// 크롬의 "앱 설치"와 폰의 "홈 화면에 추가"에 쓰이는 앱 정보
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "우리 가족 영어 시간",
    short_name: "가족영어",
    description: "가족이 함께 AI 친구 Bubbles와 영어로 대화하는 연습 앱",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0ea5e9",
    lang: "ko",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
