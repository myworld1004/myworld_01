import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리 가족 영어 시간",
  description: "가족이 함께 AI와 영어로 대화하는 연습 앱",
  appleWebApp: { capable: true, title: "가족영어", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
