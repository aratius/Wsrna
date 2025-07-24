"use client";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  return (
    <div className="auth">
      <h1 className="auth__title">Googleでサインイン</h1>
      <button className="btn" onClick={handleSignIn}>
        Googleでログイン
      </button>
    </div>
  );
}
