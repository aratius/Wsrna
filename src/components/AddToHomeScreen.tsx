"use client";

import { useEffect, useState } from "react";

export default function AddToHomeScreen() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // iOS Safariの検出
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOSDevice && isSafari) {
      setIsIOS(true);
    }

    // beforeinstallpromptイベントのリスナー（Android/Chrome用）
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      setDeferredPrompt(null);
    }
  };

  const handleIOSGuideClick = () => {
    setShowIOSGuide(!showIOSGuide);
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px" }}>
        📱 Add to Home Screen
      </h3>

      {isIOS ? (
        <div>
          <button
            onClick={handleIOSGuideClick}
            style={{
              backgroundColor: "#5856d6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Show iOS Installation Guide
          </button>

          {showIOSGuide && (
            <div
              style={{
                marginTop: "12px",
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef",
              }}
            >
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                How to add to Home Screen:
              </h4>
              <ol style={{ margin: 0, paddingLeft: "20px" }}>
                <li>Tap the Share button (📤) in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
          )}
        </div>
      ) : (
        <div>
          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              style={{
                backgroundColor: "#5856d6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Install App
            </button>
          ) : (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef",
                textAlign: "center",
                color: "#6c757d",
              }}
            >
              Install prompt will appear when available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
