import type { Metadata } from "next";
import "./globals.scss";
import "../styles/index.scss";
import SupabaseProvider from "@/components/SupabaseProvider";
import BottomNav from "@/components/BottomNav";
import {
  poppins,
  notoSansJP,
  notoSansSC,
  notoSansTC,
  notoSansKR,
  notoSans,
} from "@/styles/fonts";
import AppHeightSetter from "@/components/AppHeightSetter";

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
    <html
      lang="ja"
      className={`${poppins.variable} ${notoSansJP.variable} ${notoSansSC.variable} ${notoSansTC.variable} ${notoSansKR.variable} ${notoSans.variable}`}
    >
      <body
        style={{
          background: "#e5e5e5",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppHeightSetter />
        <div
          style={{
            position: "fixed",
            height: "100vh",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            maxWidth: 390,
            margin: "0 auto",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.05)",
            background: "#fff",
            width: "100%",
            minHeight: 667,
          }}
        >
          <SupabaseProvider>
            <div
              className="mainContent"
              style={{
                flex: "1 1 auto",
                overflowY: "auto",
                overflowX: "hidden",
                position: "relative",
                marginBottom: 56, // BottomNavの高さ分
              }}
            >
              {children}
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
              }}
            >
              <BottomNav />
            </div>
          </SupabaseProvider>
        </div>
      </body>
    </html>
  );
}
