"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/components/_button.scss";
import "@/styles/components/_card.scss";
import styles from "./page.module.scss";
import { useAppSelector } from "@/lib/hooks";

export default function Home() {
  const { user, isInitialized } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 認証状態が初期化されたらローディングを終了
    if (isInitialized) {
      setLoading(false);
    }
  }, [isInitialized]);

  useEffect(() => {
    // ログイン済みの場合は/quizへリダイレクト
    if (user && !loading) {
      router.push("/quiz");
    }
  }, [user, loading, router]);

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
      ? "https://wsrna.vercel.app/quiz" // ログイン後は/quizへリダイレクト
      : `${currentOrigin}/quiz`;

    console.log("Sign in redirect:", { currentOrigin, isProd, redirectTo });

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  };

  // ローディング中は何も表示しない
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  // ログイン済みの場合は何も表示しない（リダイレクト中）
  if (user) {
    return null;
  }

  // 未ログイン時はログインUIを表示
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>Welcome to WSRNA</h1>
            <p>
              Learn 30+ languages <br />
              with AI-powered quizzes
            </p>
          </div>
          <div className={styles.cardBody}>
            <button
              className={styles.signInButton}
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign in with Google"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
