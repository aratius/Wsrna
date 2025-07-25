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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body>
        <AppHeightSetter />
        <div className="main_wrapper">
          <SupabaseProvider>
            <PwaInstallPrompt />
            <main className="main">{/* {children} */}</main>
            <BottomNav />
          </SupabaseProvider>
        </div>
      </body>
    </html>
  );
}
