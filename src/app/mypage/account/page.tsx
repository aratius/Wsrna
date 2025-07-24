"use client";
import { useRouter } from "next/navigation";
import styles from "./account.module.scss";

export default function AccountInfoPage() {
  const router = useRouter();
  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        &lt; 戻る
      </button>
      <h2>Account Info</h2>
      <p>ここにアカウント情報が表示されます（ダミー）。</p>
    </div>
  );
}
