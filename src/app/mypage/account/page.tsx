"use client";
import { useRouter } from "next/navigation";

export default function AccountInfoPage() {
  const router = useRouter();
  return (
    <div style={{ padding: 24 }}>
      <button onClick={() => router.back()} style={{ marginBottom: 16 }}>
        &lt; 戻る
      </button>
      <h2>Account Info</h2>
      <p>ここにアカウント情報が表示されます（ダミー）。</p>
    </div>
  );
}
