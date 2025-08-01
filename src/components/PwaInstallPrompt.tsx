"use client";
import React, { useEffect, useState } from "react";
import { playButtonClick, playSuccess } from "@/lib/soundManager";

const LOCALSTORAGE_KEY = "pwa-install-dismissed";

const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // デバッグ情報を出力
    console.log("PWA Install Prompt Debug:", {
      isSecure:
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost",
      hasServiceWorker: "serviceWorker" in navigator,
      hasManifest: !!document.querySelector('link[rel="manifest"]'),
      isStandalone: window.matchMedia("(display-mode: standalone)").matches,
      supportsBeforeInstallPrompt: "beforeinstallprompt" in window,
      isDismissed: localStorage.getItem(LOCALSTORAGE_KEY) === "1",
      userAgent: navigator.userAgent,
    });

    if (localStorage.getItem(LOCALSTORAGE_KEY) === "1") {
      console.log("PWA Install Prompt: Already dismissed");
      return;
    }

    const handler = (e: any) => {
      console.log("PWA Install Prompt: beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    // iOS Safariの検出
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      console.log("PWA Install Prompt: iOS Safari detected");

      // iOS Safariの場合は手動でインストールガイドを表示
      if (!localStorage.getItem(LOCALSTORAGE_KEY)) {
        setTimeout(() => {
          setShow(true);
        }, 2000); // 2秒後に表示
      }
    } else {
      window.addEventListener("beforeinstallprompt", handler);
      console.log("PWA Install Prompt: Event listener added");
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    playSuccess();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setShow(false);
    setDeferredPrompt(null);
    if (outcome === "dismissed") {
      localStorage.setItem(LOCALSTORAGE_KEY, "1");
    }
  };

  const handleClose = () => {
    playButtonClick();
    setShow(false);
    localStorage.setItem(LOCALSTORAGE_KEY, "1");
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "32px 24px",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            background: "linear-gradient(135deg, #5856d6, #7c4dff)",
            borderRadius: "16px",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px",
            color: "#fff",
          }}
        >
          📱
        </div>

        <h3
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#222",
            margin: "0 0 12px 0",
            lineHeight: "1.3",
          }}
        >
          {isIOS ? "Add to Home Screen" : "Install as App"}
        </h3>

        <p
          style={{
            fontSize: "16px",
            color: "#666",
            margin: "0 0 24px 0",
            lineHeight: "1.5",
          }}
        >
          {isIOS
            ? "Tap the share button and select 'Add to Home Screen'"
            : "Add to your home screen for a better experience"}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={isIOS ? handleClose : handleInstall}
            style={{
              background: "linear-gradient(135deg, #5856d6, #7c4dff)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              flex: "1",
              maxWidth: "160px",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(88, 86, 214, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {isIOS ? "Got it" : "Install"}
          </button>

          <button
            onClick={handleClose}
            style={{
              background: "transparent",
              color: "#888",
              border: "2px solid #e0e0e0",
              borderRadius: "12px",
              padding: "14px 24px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              flex: "1",
              maxWidth: "160px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ccc";
              e.currentTarget.style.color = "#666";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.color = "#888";
            }}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
