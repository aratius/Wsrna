"use client";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Loading from "./Loading";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // セッションがnull（未ログイン）で、トップページ以外にいる場合
    if (session === null && pathname !== "/") {
      router.push("/");
    }
  }, [session, router, pathname]);

  // セッションがnull（未ログイン）で、トップページ以外にいる場合はローディング表示
  if (session === null && pathname !== "/") {
    return <Loading message="Redirecting..." />;
  }

  return <>{children}</>;
}
