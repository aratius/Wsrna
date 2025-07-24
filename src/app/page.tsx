"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, useSessionContext } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/components/_button.scss";
import "@/styles/components/_card.scss";

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
    <div className="card" style={{ margin: "24px 0" }}>
      <div className="card-header" style={{ marginBottom: 8 }}>
        Welcome, {session.user?.email}!
      </div>
      <div className="card-body">
        <button
          className="btn"
          onClick={handleLogout}
          style={{ marginBottom: 16 }}
        >
          Log out
        </button>
        <p style={{ color: "#888", fontSize: 15 }}>
          Dashboard and main features coming soon
        </p>
      </div>
    </div>
  );
}
