"use client";
import { useState, useEffect } from "react";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";
import { useSession } from "@supabase/auth-helpers-react";
import supportedLanguages from "@/lib/supportedLanguages.json";
import { supabase } from "@/lib/supabaseClient";
import Loading from "@/components/Loading";
import styles from "./create.module.scss";
import QuizPreviewModal from "@/components/QuizPreviewModal";

export default function CreatePage() {
  const session = useSession();
  const [fromTranslation, setFromTranslation] = useState("");
  const [toText, setToText] = useState("");
  const [languagePairs, setLanguagePairs] = useState<any[]>([]);
  const [pairLoading, setPairLoading] = useState(false);
  const [pairError, setPairError] = useState("");
  const [selectedPairId, setSelectedPairId] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [hintLevels, setHintLevels] = useState<{ [key: number]: number }>({});
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch language pairs for the user
  useEffect(() => {
    const fetchPairs = async () => {
      if (!session?.user?.id) return;
      setPairLoading(true);
      setPairError("");
      try {
        const res = await fetch(
          `/api/language-pairs?user_id=${session.user.id}`
        );
        const data = await res.json();
        if (data.error) setPairError(data.error);
        else setLanguagePairs(Array.isArray(data) ? data : [data]);
      } catch (e: any) {
        setPairError(e.message);
      } finally {
        setPairLoading(false);
      }
    };
    fetchPairs();
  }, [session]);

  // Restore last selected language pair from localStorage
  useEffect(() => {
    const lastPairId = localStorage.getItem("lastSelectedPairId");
    if (lastPairId) setSelectedPairId(lastPairId);
  }, []);

  // Save selected language pair to localStorage
  useEffect(() => {
    if (selectedPairId) {
      localStorage.setItem("lastSelectedPairId", selectedPairId);
    }
  }, [selectedPairId]);

  const handleSubmit = async (e: React.FormEvent) => {
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
  const handleSubmitQuizzes = async () => {
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
          const reviewPayload = inserted.map((q: any) => ({
            user_id: session.user.id,
            quiz_id: q.id,
            last_reviewed_at: new Date().toISOString(),
            next_review_at: new Date().toISOString().slice(0, 10),
            interval_days: 1,
            correct_streak: 0,
            created_at: new Date().toISOString(),
          }));
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

  if (!session) return null;

  // スマホ判定
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 600;
  // 選択中の言語ペアのラベル取得
  const selectedPair = languagePairs.find((lp) => lp.id === selectedPairId);
  const fromLangLabel = selectedPair
    ? supportedLanguages.find((l) => l.code === selectedPair.from_lang)
        ?.label || selectedPair.from_lang
    : "From";
  const toLangLabel = selectedPair
    ? supportedLanguages.find((l) => l.code === selectedPair.to_lang)?.label ||
      selectedPair.to_lang
    : "To";
  const fromLangGreeting = selectedPair
    ? supportedLanguages.find((l) => l.code === selectedPair.from_lang)
        ?.greeting || fromLangLabel
    : fromLangLabel;
  const toLangGreeting = selectedPair
    ? supportedLanguages.find((l) => l.code === selectedPair.to_lang)
        ?.greeting || toLangLabel
    : toLangLabel;

  return (
    <>
      {loading && (
        <Loading
          message="Generating quiz..."
          subMessage="This may take up to 30 seconds."
          fullscreen
        />
      )}
      <QuizPreviewModal
        open={showModal}
        onClose={() => setShowModal(false)}
        quizzes={quizzes}
        onSubmit={handleSubmitQuizzes}
        submitting={submitting}
      />
      <div
        className={
          styles.container + (isMobile ? " " + styles.containerMobile : "")
        }
      >
        <div className={`card-header ${styles.cardHeaderMargin}`}>
          <span className={styles.gradientText}>Create Quiz !!</span>
          <hr className={styles.gradientTextHr} />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className={styles.formWrapper}>
            {pairError && <div className={styles.formError}>{pairError}</div>}
            {languagePairs.length === 0 && !pairLoading ? (
              <div className={styles.formError}>
                No language pairs found. Please register a pair in My Page
                first.
              </div>
            ) : (
              <form className={styles.quizForm} onSubmit={handleSubmit}>
                <label
                  className={styles.formLabel}
                  htmlFor="language-pair-select"
                >
                  Language
                </label>
                <select
                  id="language-pair-select"
                  className={styles.quizFormControl}
                  value={selectedPairId}
                  onChange={(e) => setSelectedPairId(e.target.value)}
                  required
                >
                  <option value="">Select language pair (From → To)</option>
                  {languagePairs.map((lp) => (
                    <option key={lp.id} value={lp.id}>
                      {supportedLanguages.find((l) => l.code === lp.from_lang)
                        ?.label || lp.from_lang}
                      {" › "}
                      {supportedLanguages.find((l) => l.code === lp.to_lang)
                        ?.label || lp.to_lang}
                    </option>
                  ))}
                </select>
                <label className={styles.formLabel} htmlFor="from-translation">
                  From
                </label>
                <input
                  id="from-translation"
                  className={styles.quizFormControl + " " + styles.formInput}
                  type="text"
                  placeholder={`ex: ${fromLangGreeting}`}
                  value={fromTranslation}
                  onChange={(e) => setFromTranslation(e.target.value)}
                />
                <label className={styles.formLabel} htmlFor="to-text">
                  To
                  <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  id="to-text"
                  className={styles.quizFormControl + " " + styles.formInput}
                  type="text"
                  placeholder={`ex: ${toLangGreeting}`}
                  value={toText}
                  onChange={(e) => setToText(e.target.value)}
                  required
                />
                <button
                  className={styles.quizFormBtn + " " + styles.formBtn}
                  type="submit"
                  disabled={loading || !selectedPairId}
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </form>
            )}
            {error && <div className={styles.quizFormError}>{error}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
