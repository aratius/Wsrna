import React from "react";

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
      style={{
        position: fullscreen ? "fixed" : "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(255,255,255,0.85)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div
          className="loading-spinner"
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
      <div
        style={{
          fontSize: 18,
          color: "#222",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {message}
      </div>
      {subMessage && (
        <div style={{ fontSize: 14, color: "#888" }}>{subMessage}</div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
