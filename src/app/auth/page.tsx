"use client";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/components/_button.scss";
import "@/styles/components/_card.scss";

export default function AuthPage() {
  const handleSignIn = async () => {
    // 現在のホスト名とポートを取得してリダイレクト先を決定
    const currentOrigin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    const isProd =
      typeof window !== "undefined" &&
      !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("192.168.0.2") &&
      !window.location.hostname.includes("127.0.0.1");

    const redirectTo = isProd
      ? "https://wsrna.vercel.app/" // ←本番ドメインに書き換えてください
      : `${currentOrigin}/`;

    console.log("Sign in redirect:", { currentOrigin, isProd, redirectTo });

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  return (
    <div className="card" style={{ maxWidth: 320, margin: "40px auto" }}>
      <div className="card-header" style={{ marginBottom: 12 }}>
        Sign in with Google
      </div>
      <div className="card-body">
        <button
          className="btn"
          onClick={handleSignIn}
          style={{ width: "100%" }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
