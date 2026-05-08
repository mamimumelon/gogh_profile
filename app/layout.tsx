import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "gogh プロフィール帳メーカー",
  description:
    "gogh のお部屋・好きな家具・コーデなどを書き込めるプロフィール帳メーカー。画像として保存して SNS でシェアできます。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hachi+Maru+Pop&family=Yusei+Magic&family=Mochiy+Pop+One&family=Klee+One:wght@400;600&family=DotGothic16&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
