"use client";
import { useRouter } from "next/navigation";
import styles from "./account.module.scss";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";

export default function AccountInfoPage() {
  const router = useRouter();
  const session = useSession();
  const email = session?.user?.email;
  const name =
    session?.user?.user_metadata?.name ||
    session?.user?.user_metadata?.full_name ||
    "-";
  const avatarUrl = session?.user?.user_metadata?.avatar_url;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card + " card"}>
        <button onClick={() => router.back()} className={styles.backButton}>
          &lt; 戻る
        </button>
        <h2 className={styles.title}>Account Info</h2>
        <div className={styles.accountInfoBox}>
          {avatarUrl && (
            <img src={avatarUrl} alt="avatar" className={styles.avatar} />
          )}
          <div className={styles.accountInfoText}>
            <div className={styles.userName}>{name}</div>
            <div className={styles.userEmail}>{email || "-"}</div>
          </div>
        </div>
        <div className={styles.infoBox}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
}
