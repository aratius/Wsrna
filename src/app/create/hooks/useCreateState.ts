import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function useCreateState() {
  const session = useSession();
  const searchParams = useSearchParams();
  const [fromTranslation, setFromTranslation] = useState("");
  const [toText, setToText] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [hintLevels, setHintLevels] = useState<{ [key: number]: number; }>({});
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Set initial values from URL query parameters
  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    if (fromParam) {
      setFromTranslation(decodeURIComponent(fromParam));
    }
    if (toParam) {
      setToText(decodeURIComponent(toParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent, selectedPairId: string, languagePairs: any[]) => {
    e.preventDefault();
    if (!selectedPairId) return;
    if (!toText.trim()) {
      setError("The 'To' field is required.");
      return;
    }
    setLoading(true);
    setError("");
    setQuizzes([]);
    setHintLevels({});
    const pair = languagePairs.find((lp) => lp.id === selectedPairId);
    if (!pair) {
      setError("Please select a language pair.");
      setLoading(false);
      return;
    }
    const fromLang = pair.from_lang;
    const toLang = pair.to_lang;
    try {
      // main_word, main_word_translationsはユーザー入力や選択から取得する場合はここで指定
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          main_word: toText.trim(),
          main_word_translations: fromTranslation.trim()
            ? [fromTranslation.trim()]
            : [],
          toText: toText.trim(),
          fromLang: String(fromLang),
          toLang: String(toLang),
        }),
      });
      const data = await res.json();
      if (data.error) {
        // Log error details to console
        console.error("Quiz generation error:", data);
        setError(
          "An error occurred while generating the quiz. Please try again."
        );
        return;
      } else if (Array.isArray(data.questions)) {
        // main_wordの最頻値でフィルタ
        const freq: Record<string, number> = {};
        data.questions.forEach((q: any) => {
          if (q.main_word) freq[q.main_word] = (freq[q.main_word] || 0) + 1;
        });
        const mostFreq = Object.entries(freq).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0];
        const filtered = data.questions.filter(
          (q: any) => q.main_word === mostFreq
        );
        setQuizzes(filtered);
      } else setError("API response is invalid: " + JSON.stringify(data));
    } catch (e: any) {
      console.error("Quiz generation fetch error:", e);
      setError("A network or server error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showNextHint = (idx: number) => {
    setHintLevels((prev) => ({
      ...prev,
      [idx]: Math.min((prev[idx] || 0) + 1, 4),
    }));
  };

  // Submit quizzes to Supabase
  const handleSubmitQuizzes = async (selectedPairId: string) => {
    if (!session?.user?.id || quizzes.length === 0) return;
    setSubmitting(true);
    try {
      // 既存main_word一覧を取得
      const { data: existing, error: fetchError } = await supabase
        .from("quizzes")
        .select("main_word")
        .eq("user_id", session.user.id);
      if (fetchError) {
        alert("Failed to check existing quizzes: " + fetchError.message);
        setSubmitting(false);
        return;
      }
      const existingWords = (existing || []).map((q: any) => q.main_word);
      // 重複しないクイズだけをinsert
      const newQuizzes = quizzes.filter(
        (q: any) => q.main_word && !existingWords.includes(q.main_word)
      );
      if (newQuizzes.length === 0) {
        alert("All main words are already registered.");
        setSubmitting(false);
        return;
      }
      // idiomsテーブルにinsert（未登録なら）し、idiom_idを取得
      const quizPayload = [];
      for (const q of newQuizzes) {
        // idioms APIにPOST
        const idiomRes = await fetch("/api/idioms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: session.user.id,
            main_word: q.main_word,
            main_word_translations: q.main_word_translations,
            explanation: q.explanation,
            language_pair_id: selectedPairId,
          }),
        });
        const idiom = await idiomRes.json();
        if (idiom.error || !idiom.id) {
          alert("Failed to save idiom: " + (idiom.error || "No idiom id"));
          setSubmitting(false);
          return;
        }
        quizPayload.push({
          user_id: session.user.id,
          idiom_id: idiom.id,
          question: q.question,
          answer: q.answer,
          main_word: q.main_word,
          main_word_translations: q.main_word_translations,
          sentence_translation: q.sentence_translation,
          explanation: q.explanation,
          hint_levels: q.hint_levels, // hint_levelsを追加
          dictionary: q.dictionary, // dictionaryを追加
          // topic: q.topic || topic, // topic消す
          created_at: new Date().toISOString(),
          language_pair_id: selectedPairId,
        });
      }
      const { error } = await supabase.from("quizzes").insert(quizPayload);
      if (error) alert("Failed to save quizzes: " + error.message);
      else {
        // 新規クイズ保存後、quiz_reviewsもinsert
        const { data: inserted } = await supabase
          .from("quizzes")
          .select("id")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(quizPayload.length);
        if (inserted && inserted.length > 0) {
          // イディオムセットごとにグループ化
          const idiomGroups = new Map<string, any[]>();
          inserted.forEach((quiz: any) => {
            const idiomId = quiz.idiom_id;
            if (!idiomGroups.has(idiomId)) {
              idiomGroups.set(idiomId, []);
            }
            idiomGroups.get(idiomId)!.push(quiz);
          });

          // 各イディオムセットから1問だけを今日の復習リストに追加
          const reviewPayload = [];
          for (const [idiomId, quizzes] of idiomGroups) {
            // ランダムに1問を選択
            const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
            reviewPayload.push({
              user_id: session.user.id,
              quiz_id: randomQuiz.id,
              last_reviewed_at: new Date().toISOString(),
              next_review_at: new Date().toISOString().slice(0, 10), // 今日
              interval_days: 1,
              correct_streak: 0,
              created_at: new Date().toISOString(),
            });

            // 残りの問題は何もしない（復習リストに登録しない）
          }
          await supabase.from("quiz_reviews").insert(reviewPayload);
        }
        alert("Quizzes saved!");
        setShowModal(false);
        setToText("");
        setFromTranslation("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // quizzesがセットされたら自動でモーダルを開く
  useEffect(() => {
    if (quizzes.length > 0) {
      setShowModal(true);
    }
  }, [quizzes]);

  return {
    fromTranslation,
    setFromTranslation,
    toText,
    setToText,
    loading,
    quizzes,
    error,
    hintLevels,
    showModal,
    setShowModal,
    submitting,
    handleSubmit,
    showNextHint,
    handleSubmitQuizzes,
  };
}