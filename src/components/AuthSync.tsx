"use client";
import { useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useAppDispatch } from "@/lib/hooks";
import { setSession, clearAuth } from "@/lib/slices/authSlice";
import {
  fetchLanguagePairs,
  clearLanguagePairs,
} from "@/lib/slices/languagePairsSlice";

export default function AuthSync() {
  const session = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (session) {
      // セッションが存在する場合、認証情報をストアに保存
      dispatch(setSession(session));

      // ユーザーIDが存在する場合、language_pairsを取得
      if (session.user?.id) {
        dispatch(fetchLanguagePairs(session.user.id));
      }
    } else {
      // セッションが存在しない場合、認証情報をクリア
      dispatch(clearAuth());
      dispatch(clearLanguagePairs());
    }
  }, [session, dispatch]);

  // このコンポーネントは何もレンダリングしない
  return null;
}
