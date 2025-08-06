import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { playSuccess } from "@/lib/soundManager";

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
      } else if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
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

        // 5つ未満の場合は警告を表示
        if (filtered.length < 5) {
          console.warn(`Generated ${filtered.length} questions instead of 5`);
        }
      } else {
        setError("API response is invalid: " + JSON.stringify(data));
      }
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
      // 1. 重複チェックを効率化（main_wordのみを取得）
      const { data: existing, error: fetchError } = await supabase
        .from("quizzes")
        .select("main_word")
        .eq("user_id", session.user.id)
        .in("main_word", quizzes.map((q: any) => q.main_word));

      if (fetchError) {
        alert("Failed to check existing quizzes: " + fetchError.message);
        setSubmitting(false);
        return;
      }

      const existingWords = new Set((existing || []).map((q: any) => q.main_word));
      const newQuizzes = quizzes.filter((q: any) => q.main_word && !existingWords.has(q.main_word));

      if (newQuizzes.length === 0) {
        alert("All main words are already registered.");
        setSubmitting(false);
        return;
      }

      // 2. 既存のidiomをチェック
      const { data: existingIdioms, error: idiomCheckError } = await supabase
        .from("idioms")
        .select("id, main_word")
        .eq("user_id", session.user.id)
        .in("main_word", newQuizzes.map((q: any) => q.main_word));

      if (idiomCheckError) {
        alert("Failed to check existing idioms: " + idiomCheckError.message);
        setSubmitting(false);
        return;
      }

      const existingIdiomMap = new Map(existingIdioms?.map((i: any) => [i.main_word, i.id]) || []);

      // 3. idiomの挿入・更新を個別処理
      const idiomIdMap = new Map();

      for (const quiz of newQuizzes) {
        const existingIdiomId = existingIdiomMap.get(quiz.main_word);

        if (existingIdiomId) {
          // 既存のidiomを更新
          const { data: updatedIdiom, error: updateError } = await supabase
            .from("idioms")
            .update({
              main_word_translations: quiz.main_word_translations,
              explanation: quiz.explanation,
              language_pair_id: selectedPairId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingIdiomId)
            .select("id, main_word")
            .single();

          if (updateError) {
            console.error(`Failed to update idiom for ${quiz.main_word}:`, updateError);
            continue;
          }

          idiomIdMap.set(quiz.main_word, updatedIdiom.id);
        } else {
          // 新規のidiomを挿入
          const { data: newIdiom, error: insertError } = await supabase
            .from("idioms")
            .insert({
              user_id: session.user.id,
              main_word: quiz.main_word,
              main_word_translations: quiz.main_word_translations,
              explanation: quiz.explanation,
              language_pair_id: selectedPairId,
              created_at: new Date().toISOString(),
              correct_streak: -1,
              next_review_at: new Date().toISOString().slice(0, 10),
            })
            .select("id, main_word")
            .single();

          if (insertError) {
            console.error(`Failed to insert idiom for ${quiz.main_word}:`, insertError);
            continue;
          }

          idiomIdMap.set(quiz.main_word, newIdiom.id);
        }
      }

      // 4. 成功したidiomのクイズを一括挿入
      const successfulQuizzes = newQuizzes.filter(q => idiomIdMap.has(q.main_word));

      if (successfulQuizzes.length > 0) {
        const quizPayload = successfulQuizzes.map((q: any) => ({
          user_id: session.user.id,
          idiom_id: idiomIdMap.get(q.main_word),
          question: q.question,
          answer: q.answer,
          main_word: q.main_word,
          main_word_translations: q.main_word_translations,
          sentence_translation: q.sentence_translation,
          explanation: q.explanation,
          hint_levels: q.hint_levels,
          dictionary: q.dictionary,
          created_at: new Date().toISOString(),
          language_pair_id: selectedPairId,
        }));

        const { error: quizError } = await supabase.from("quizzes").insert(quizPayload);

        if (quizError) {
          alert("Failed to save quizzes: " + quizError.message);
        } else {
          alert(`Saved ${successfulQuizzes.length} quizzes!`);
          setQuizzes([]);
          setShowModal(false); // プレビューモーダルを閉じる
          setFromTranslation(""); // Fromフォームをクリア
          setToText(""); // Toフォームをクリア
        }
      } else {
        alert("No quizzes were saved due to errors.");
      }
    } catch (error) {
      console.error("Error saving quizzes:", error);
      alert("An unexpected error occurred while saving quizzes.");
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