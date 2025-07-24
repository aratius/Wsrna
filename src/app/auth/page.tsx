"use client";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/_base.scss";
import "@/styles/components/_button.scss";
import "@/styles/components/_card.scss";

export default function AuthPage() {
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
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
