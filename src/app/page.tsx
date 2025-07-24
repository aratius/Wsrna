"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/components/_button.scss";
import "@/styles/components/_card.scss";
import styles from "./page.module.scss";

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
    <div className={`card ${styles.cardMargin}`}>
      <div className={`card-header ${styles.cardHeaderMargin}`}>
        Welcome, {session.user?.email}!
      </div>
      <div className="card-body">
        <button className={`btn ${styles.logoutButton}`} onClick={handleLogout}>
          Log out
        </button>
        <p className={styles.infoText}>
          Dashboard and main features coming soon
        </p>
      </div>
    </div>
  );
}
