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
  const [hasInitialized, setHasInitialized] = useState(false);

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
      isLoading,
      "hasInitialized:",
      hasInitialized
    );

    // セッションの初期化が完了するまで待つ
    if (session !== undefined && !hasInitialized) {
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [session, hasInitialized, isLoading]);

  // リダイレクト処理を別のuseEffectで管理
  useEffect(() => {
    if (!hasInitialized) return; // 初期化完了前は何もしない

    // 少し待ってからリダイレクト処理を実行（セッションの安定化を待つ）
    const timeoutId = setTimeout(() => {
      // セッションがnull（未ログイン）で、トップページ以外にいる場合
      if (session === null && pathname !== "/") {
        console.log("AuthGuard - redirecting to / because session is null");
        router.push("/");
        return;
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
        return;
      }
    }, 100); // 100ms待つ

    return () => clearTimeout(timeoutId);
  }, [session, pathname, hasInitialized, router]);

  // セッションが有効な場合は即座にコンテンツを表示
  if (session && isValidSession(session)) {
    return <>{children}</>;
  }

  // セッションの初期化中はローディング表示
  if (isLoading || !hasInitialized) {
    return <LoadingWithSound message="Loading..." />;
  }

  // セッションがnullで初期化済みの場合のみリダイレクト
  if (session === null && pathname !== "/") {
    return <LoadingWithSound message="Redirecting..." />;
  }

  // その他の場合はコンテンツを表示（セッションがnullでもトップページの場合は表示）
  return <>{children}</>;
}
