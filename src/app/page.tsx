"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const session = useSession();
  const { isLoading } = useSessionContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session === null) {
      router.replace("/auth");
    }
  }, [session, isLoading, router]);

  if (isLoading) return null; // ローディング中は何も表示しない
  if (!session) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  return (
    <main>
      <h1>ようこそ、{session.user?.email} さん！</h1>
      <button
        className="btn"
        onClick={handleLogout}
        style={{ marginBottom: 16 }}
      >
        ログアウト
      </button>
      <p>（ここにダッシュボードやメイン機能を追加予定）</p>
    </main>
  );
}
