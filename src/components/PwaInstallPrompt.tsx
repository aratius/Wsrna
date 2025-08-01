"use client";
import React, { useEffect, useState } from "react";

const LOCALSTORAGE_KEY = "pwa-install-dismissed";

const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(LOCALSTORAGE_KEY) === "1") return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setShow(false);
    setDeferredPrompt(null);
    if (outcome === "dismissed") {
      localStorage.setItem(LOCALSTORAGE_KEY, "1");
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(LOCALSTORAGE_KEY, "1");
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "#fffbe8",
        borderTop: "1px solid #eee",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        padding: "18px 16px 12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontWeight: 600, color: "#222" }}>Install as App</span>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleInstall}
          style={{
            background: "#5856d6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Install
        </button>
        <button
          onClick={handleClose}
          style={{
            background: "transparent",
            color: "#888",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
