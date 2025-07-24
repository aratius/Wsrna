"use client";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/components/_button.scss";
import "@/styles/components/_card.scss";

export default function AuthPage() {
  const handleSignIn = async () => {
    const isProd =
      typeof window !== "undefined" && window.location.hostname !== "localhost";
    const redirectTo = isProd
      ? "https://wsrna.vercel.app/" // ←本番ドメインに書き換えてください
      : "http://localhost:3000/";
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
