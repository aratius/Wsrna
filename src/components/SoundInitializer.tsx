"use client";

import { useEffect } from "react";
import soundManager from "../lib/soundManager";

/**
 * サウンドマネージャーを初期化するコンポーネント
 * アプリケーションのルートで一度だけ実行される
 */
export default function SoundInitializer() {
  useEffect(() => {
    const initializeSound = async () => {
      try {
        await soundManager.initialize();
        console.log("Sound system initialized");
      } catch (error) {
        console.error("Failed to initialize sound system:", error);
      }
    };

    window.addEventListener("click", initializeSound, { once: true });
    window.addEventListener("touchstart", initializeSound, { once: true });
  }, []);

  // このコンポーネントは何もレンダリングしない
  return null;
}
