import React from "react";
import styles from "./Loading.module.scss";

interface LoadingProps {
  message?: string;
  subMessage?: string;
  fullscreen?: boolean;
  spinnerColor?: string;
  spinnerSize?: number;
}

export default function Loading({
  message = "Loading...",
  subMessage,
  fullscreen = true,
  spinnerColor = "#3d7fff",
  spinnerSize = 48,
}: LoadingProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={styles.overlay}
      style={{
        position: fullscreen ? "fixed" : "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "calc(var(--vh) * 100)",
        background: "rgba(255,255,255,0.85)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className={styles.spinnerWrapper}>
        <div
          className={styles.spinner}
          style={{
            width: spinnerSize,
            height: spinnerSize,
            border: `${Math.max(4, spinnerSize / 12)}px solid #eee`,
            borderTop: `${Math.max(
              4,
              spinnerSize / 12
            )}px solid ${spinnerColor}`,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
      <div className={styles.message}>{message}</div>
      {subMessage && <div className={styles.subMessage}>{subMessage}</div>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
