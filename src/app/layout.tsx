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
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

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
            maxWidth: 390,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            height: "100vh",
          }}
        >
          <SupabaseProvider>
            <PwaInstallPrompt />
            <div
              className="mainContent"
              style={{
                flex: 1,
                overflow: "auto",
              }}
            >
              {children}
            </div>
            <BottomNav />
          </SupabaseProvider>
        </div>
      </body>
    </html>
  );
}
