import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";

export function useQuizData() {
  const session = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [languagePairs, setLanguagePairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // localStorage key
  const LS_KEY = "quiz_selectedPairId";

  // localStorageから直接値を取得する関数
  const getSelectedPairId = (): string => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(LS_KEY) || "";
  };

  // localStorageに直接値を設定する関数
  const setSelectedPairId = (id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEY, id);
    }
  };

  // クイズデータ取得
  useEffect(() => {
    const fetchReviews = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      setError("");
      try {
        const selectedPairId = getSelectedPairId();
        const res = await fetch("/api/review-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: session.user.id,
            language_pair_id: selectedPairId || undefined
          }),
        });
        const data = await res.json();
        if (data.error) setError(data.error);
        else {
          setReviews(data || []);
          console.log("review-list data:", data);
          // デバッグ: quizデータの確認
          if (data && data.length > 0) {
            console.log("Sample review data:", data[0]);
            console.log("Quiz data exists:", !!data[0]?.quiz);
          }
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [session, languagePairs]);

  // Language Pair取得
  useEffect(() => {
    const fetchPairs = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(
          `/api/language-pairs?user_id=${session.user.id}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setLanguagePairs(data);

          // localStorageに保存された値がある場合、その値が有効な言語ペアIDかチェック
          const currentSelectedPairId = getSelectedPairId();
          if (currentSelectedPairId) {
            const isValidPair = data.some(pair => pair.id === currentSelectedPairId);
            if (!isValidPair && data.length > 0) {
              // localStorageの値が無効な場合、最初のペアを選択
              setSelectedPairId(data[0].id);
            }
          } else if (data.length > 0) {
            // localStorageに値がない場合、最初のペアを選択
            setSelectedPairId(data[0].id);
          }
        }
      } catch { }
    };
    fetchPairs();
  }, [session]);

  return {
    reviews,
    languagePairs,
    selectedPairId: getSelectedPairId(),
    setSelectedPairId,
    loading,
    error,
  };
}