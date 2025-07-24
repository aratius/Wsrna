import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/index.scss";
import SupabaseProvider from "@/components/SupabaseProvider";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "wsrna",
  description: "カラフルで遊び心のある復習アプリ",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icons/icon-192x192.png" },
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={geistSans.className}
        style={{
          background: "#e5e5e5",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 390,
            margin: "0 auto",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.05)",
            background: "#fff", // $color-background
            width: "100%",
            minHeight: 667,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <SupabaseProvider>
            {children}
            <BottomNav />
          </SupabaseProvider>
        </div>
      </body>
    </html>
  );
}
