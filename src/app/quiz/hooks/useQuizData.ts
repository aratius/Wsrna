import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";

export function useQuizData() {
  const session = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [languagePairs, setLanguagePairs] = useState<any[]>([]);
  const [selectedPairId, setSelectedPairIdState] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // localStorage key
  const LS_KEY = "quiz_selectedPairId";

  // 初期化時にlocalStorageからselectedPairIdを取得
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setSelectedPairIdState(stored);
    }
  }, []);

  // setSelectedPairId: localStorageにも保存
  const setSelectedPairId = (id: string) => {
    setSelectedPairIdState(id);
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
  }, [session, selectedPairId]);

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
          if (!selectedPairId && data.length > 0) setSelectedPairId(data[0].id);
        }
      } catch { }
    };
    fetchPairs();
  }, [session, selectedPairId]);

  // languagePairsが変わったとき、selectedPairIdが未設定なら自動でセット
  useEffect(() => {
    if (!selectedPairId && languagePairs.length > 0) {
      setSelectedPairId(languagePairs[0].id);
    }
  }, [languagePairs, selectedPairId]);

  return {
    reviews,
    languagePairs,
    selectedPairId,
    setSelectedPairId,
    loading,
    error,
  };
}