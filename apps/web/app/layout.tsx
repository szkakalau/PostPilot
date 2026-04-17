import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PostPilot",
  description: "Schedule and publish social posts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="container" style={{ padding: "22px 0 60px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
