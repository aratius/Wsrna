"use client";
import { useState, useEffect } from "react";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";
import { useSession } from "@supabase/auth-helpers-react";
import supportedLanguages from "@/lib/supportedLanguages.json";
import { supabase } from "@/lib/supabaseClient";
import Loading from "@/components/Loading";

function QuizPreviewModal({
  open,
  onClose,
  quizzes,
  onSubmit,
  submitting,
}: any) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="quiz-modal"
        style={{
          background: "#fff",
          borderRadius: 12,
          maxWidth: 400,
          width: "90vw",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 24,
          boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
        }}
      >
        <h2
          style={{
            marginBottom: 16,
            fontWeight: 700,
            fontSize: 22,
            color: "#222",
          }}
        >
          Quiz Preview
        </h2>
        {quizzes.map((q: any, idx: number) => (
          <div
            key={idx}
            className="card"
            style={{
              marginBottom: 24,
              padding: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              borderRadius: 10,
              border: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            {q.main_word && (
              <div style={{ marginBottom: 6 }}>
                <span
                  style={{
                    display: "block",
                    fontWeight: 700,
                    fontSize: 20,
                    color: "#222",
                    wordBreak: "break-word",
                  }}
                >
                  {q.main_word}
                </span>
                {Array.isArray(q.main_word_translations) &&
                  q.main_word_translations.length > 0 && (
                    <span
                      style={{
                        display: "block",
                        marginTop: 2,
                        color: "#007AFF",
                        fontWeight: 500,
                        fontSize: 15,
                        wordBreak: "break-word",
                      }}
                    >
                      [
                      {q.main_word_translations.map((t: string, i: number) => (
                        <span key={i}>
                          {t}
                          {i < q.main_word_translations.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      ]
                    </span>
                  )}
              </div>
            )}
            {/* Quiz, Answer, Translation, Explanation をカードでラップ */}
            <div
              className="card"
              style={{
                marginBottom: 10,
                padding: 14,
                borderRadius: 8,
                background: "#f9f9fb",
                border: "1px solid #ececec",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* Quiz部分 */}
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#5856d6",
                    marginBottom: 6,
                    fontSize: 15,
                  }}
                >
                  Quiz
                </span>
                <div
                  style={{
                    color: "#222",
                    fontSize: 16,
                    whiteSpace: "pre-line",
                  }}
                >
                  {q.question}
                </div>
              </div>
              {/* Answer部分 */}
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#34c759",
                    fontSize: 15,
                    display: "block",
                  }}
                >
                  Answer
                </span>
                <div
                  style={{
                    color: "#222",
                    fontSize: 16,
                    whiteSpace: "pre-line",
                  }}
                >
                  {q.answer}
                </div>
              </div>
              {/* Translation部分 */}
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#ff9500",
                    fontSize: 15,
                    display: "block",
                  }}
                >
                  Translation
                </span>
                <div
                  style={{
                    color: "#222",
                    fontSize: 16,
                    whiteSpace: "pre-line",
                  }}
                >
                  {q.sentence_translation}
                </div>
              </div>
              {/* Explanation部分 */}
              {q.explanation && (
                <div
                  style={{
                    color: "#888",
                    fontSize: 13,
                    background: "#f8f8f8",
                    borderRadius: 6,
                    padding: "8px 12px",
                    marginTop: 4,
                  }}
                >
                  {q.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            className="btn"
            onClick={onClose}
            style={{ flex: 1, background: "#ccc", color: "#222" }}
          >
            Close
          </button>
          <button
            className="btn"
            onClick={onSubmit}
            style={{ flex: 2 }}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
      setError("To（出題言語）は必須です。");
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
        // エラー詳細はconsoleに
        console.error("Quiz generation error:", data);
        setError(
          "クイズ生成中にエラーが発生しました。もう一度生成してください。"
        );
        // main_wordの最頻値でフィルタ
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
      setError(e.message);
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
  return (
    <>
      {loading && (
        <Loading
          message="クイズを生成中です"
          subMessage="最大30秒ほどかかる場合があります"
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
        style={{
          width: "100vw",
          minHeight: "100vh",
          margin: 0,
          padding: isMobile ? 16 : 24,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            Create Quiz !!
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div
              className="quiz-form-wrapper"
              style={{ maxWidth: 420, margin: "0 auto", padding: 0 }}
            >
              {pairLoading && (
                <div className="quiz-form-status">
                  Loading language pairs...
                </div>
              )}
              {pairError && <div className="quiz-form-error">{pairError}</div>}
              {languagePairs.length === 0 && !pairLoading ? (
                <div className="quiz-form-error">
                  No language pairs found. Please register a pair in My Page
                  first.
                </div>
              ) : (
                <form className="quiz-form" onSubmit={handleSubmit}>
                  <select
                    className="quiz-form-control"
                    value={selectedPairId}
                    onChange={(e) => setSelectedPairId(e.target.value)}
                    required
                  >
                    <option value="">Select language pair (From → To)</option>
                    {languagePairs.map((lp) => (
                      <option key={lp.id} value={lp.id}>
                        {supportedLanguages.find((l) => l.code === lp.from_lang)
                          ?.label || lp.from_lang}
                        {" → "}
                        {supportedLanguages.find((l) => l.code === lp.to_lang)
                          ?.label || lp.to_lang}
                      </option>
                    ))}
                  </select>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      marginTop: 4,
                      marginBottom: 6,
                      color: "#888",
                    }}
                    htmlFor="from-translation"
                  >
                    From
                  </label>
                  <input
                    id="from-translation"
                    className="quiz-form-control"
                    type="text"
                    placeholder="例: 役に立たない"
                    value={fromTranslation}
                    onChange={(e) => setFromTranslation(e.target.value)}
                    style={{ fontSize: 15 }}
                  />
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      marginTop: 8,
                      marginBottom: 6,
                      color: "#888",
                    }}
                    htmlFor="to-text"
                  >
                    To
                    <span style={{ color: "#ff3b30", marginLeft: 2 }}>*</span>
                  </label>
                  <input
                    id="to-text"
                    className="quiz-form-control"
                    type="text"
                    placeholder="例: useless"
                    value={toText}
                    onChange={(e) => setToText(e.target.value)}
                    required
                    style={{ fontSize: 15 }}
                  />
                  <button
                    className="quiz-form-btn"
                    type="submit"
                    disabled={loading || !selectedPairId}
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                </form>
              )}
              {error && <div className="quiz-form-error">{error}</div>}
            </div>
          </div>
        </div>
      </div>
      {/* Remove non-modal quiz preview. Only keep modal-based preview. */}
    </>
  );
}
