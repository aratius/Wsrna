"use client";
import React, { useEffect, useState } from "react";

const PwaInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: any) => {
      // e.preventDefault();
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
  };

  return (
    <button
      onClick={handleInstall}
      style={{
        background: "#5856d6",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "12px 20px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        width: "100%",
        marginTop: "16px",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#4b3bbd";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#5856d6";
      }}
    >
      📱 Install As App
    </button>
  );
};

export default PwaInstallButton;
