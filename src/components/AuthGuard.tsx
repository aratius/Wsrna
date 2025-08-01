"use client";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingWithSound from "./LoadingWithSound";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // セッションの有効性をチェックする関数
  const isValidSession = (session: any) => {
    if (!session) return false;
    if (!session.user) return false;
    if (!session.user.id) return false;
    if (!session.user.email) return false;
    if (!session.access_token) return false;
    return true;
  };

  useEffect(() => {
    console.log(
      "AuthGuard - session:",
      session,
      "pathname:",
      pathname,
      "isLoading:",
      isLoading
    );

    // セッションの初期化が完了するまで待つ
    if (session !== undefined) {
      setIsLoading(false);

      // セッションがnull（未ログイン）で、トップページ以外にいる場合
      if (session === null && pathname !== "/") {
        console.log("AuthGuard - redirecting to / because session is null");
        router.push("/");
      }

      // 空ログイン状態の検出（セッションは存在するがユーザー情報が不完全）
      if (session && !isValidSession(session)) {
        console.log("AuthGuard - redirecting to / because of invalid session", {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasUserId: !!session?.user?.id,
          hasEmail: !!session?.user?.email,
          hasAccessToken: !!session?.access_token,
        });
        router.push("/");
      }
    }
  }, [session, router, pathname, isLoading]);

  // セッションの初期化中はローディング表示
  if (isLoading) {
    return <LoadingWithSound message="Loading..." />;
  }

  // セッションがnull（未ログイン）で、トップページ以外にいる場合はローディング表示
  if (session === null && pathname !== "/") {
    console.log("AuthGuard - showing redirect loading");
    return <LoadingWithSound message="Redirecting..." />;
  }

  return <>{children}</>;
}
