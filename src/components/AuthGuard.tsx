"use client";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "./Loading";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

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
    }
  }, [session, router, pathname, isLoading]);

  // セッションの初期化中はローディング表示
  if (isLoading) {
    return <Loading message="Loading..." />;
  }

  // セッションがnull（未ログイン）で、トップページ以外にいる場合はローディング表示
  if (session === null && pathname !== "/") {
    console.log("AuthGuard - showing redirect loading");
    return <Loading message="Redirecting..." />;
  }

  return <>{children}</>;
}
