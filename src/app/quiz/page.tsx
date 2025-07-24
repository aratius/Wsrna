"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";
import supportedLanguages from "@/lib/supportedLanguages.json";

function DetailsModal({ open, onClose, quiz }: any) {
  if (!open || !quiz) return null;
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
        <h2 style={{ marginBottom: 16 }}>Details</h2>
        {quiz.main_word && (
          <div style={{ marginBottom: 8 }}>
            <b>Main word:</b> {quiz.main_word}
            {Array.isArray(quiz.main_word_translations) &&
              quiz.main_word_translations.length > 0 && (
                <span style={{ marginLeft: 8, color: "#007AFF" }}>
                  [
                  {quiz.main_word_translations.map((t: string, i: number) => (
                    <span key={i}>
                      {t}
                      {i < quiz.main_word_translations.length - 1 ? ", " : ""}
                    </span>
                  ))}
                  ]
                </span>
              )}
          </div>
        )}
        {quiz.explanation && (
          <div style={{ marginBottom: 8 }}>
            <b>Explanation:</b> {quiz.explanation}
          </div>
        )}
        <button
          className="btn"
          onClick={onClose}
          style={{ marginTop: 16, width: "100%" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const session = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [languagePairs, setLanguagePairs] = useState<any[]>([]);
  const [selectedPairId, setSelectedPairId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [results, setResults] = useState<{ [id: string]: boolean | null }>({});
  const [updating, setUpdating] = useState<{ [id: string]: boolean }>({});
  const [hintIndexes, setHintIndexes] = useState<{ [id: string]: number }>({});
  const [showDetails, setShowDetails] = useState<{ [id: string]: boolean }>({});
  const [currentIndex, setCurrentIndex] = useState(0);

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
          body: JSON.stringify({ user_id: session.user.id }),
        });
        const data = await res.json();
        if (data.error) setError(data.error);
        else {
          setReviews(data || []);
          console.log("review-list data:", data);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [session]);

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
      } catch {}
    };
    fetchPairs();
  }, [session]);

  // タブ切り替え時にcurrentIndexリセット
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedPairId]);

  // 選択中のLanguage Pairのクイズのみ表示
  const filteredReviews = selectedPairId
    ? reviews.filter((r) => r.quiz?.language_pair_id === selectedPairId)
    : reviews;

  const handleAnswer = async (review: any) => {
    const quiz = review.quiz;
    const userAnswer = answers[review.id]?.trim();
    if (!userAnswer) return;
    const isCorrect = userAnswer === quiz.answer;
    setResults((prev) => ({ ...prev, [review.id]: isCorrect }));
    setUpdating((prev) => ({ ...prev, [review.id]: true }));
    await fetch("/api/review-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: review.user_id,
        quiz_id: review.quiz_id,
        correct: isCorrect,
      }),
    });
    setUpdating((prev) => ({ ...prev, [review.id]: false }));
  };

  const handleShowHint = (id: string, quiz: any) => {
    setHintIndexes((prev) => {
      const current = prev[id] || 0;
      if (quiz.hint_levels && current < quiz.hint_levels.length) {
        return { ...prev, [id]: current + 1 };
      }
      return prev;
    });
  };

  // 1問ずつ表示するロジック
  const review = filteredReviews[currentIndex];
  const isFinished =
    filteredReviews.length > 0 && currentIndex >= filteredReviews.length;

  return (
    <div style={{ padding: "24px 0" }}>
      {/* タブUI */}
      <nav
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 20,
          overflowX: "auto",
          borderBottom: "1.5px solid #e0e0e0",
          WebkitOverflowScrolling: "touch",
        }}
        className="tab-scrollbar"
      >
        {languagePairs.map((lp) => {
          const active = selectedPairId === lp.id;
          return (
            <button
              key={lp.id}
              onClick={() => setSelectedPairId(lp.id)}
              style={{
                background: "none",
                border: "none",
                outline: "none",
                borderBottom: active
                  ? "3px solid #007aff"
                  : "3px solid transparent",
                color: active ? "#007aff" : "#888",
                fontWeight: active ? 700 : 500,
                fontSize: 16,
                padding: "10px 18px",
                cursor: "pointer",
                transition: "color 0.2s, border-bottom 0.2s",
                backgroundColor: "transparent",
                whiteSpace: "nowrap",
                marginRight: 2,
              }}
            >
              {(lp.from_lang || "").toUpperCase()}
              <span
                style={{
                  margin: "0 4px",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "inherit",
                }}
              >
                ›
              </span>
              {(lp.to_lang || "").toUpperCase()}
            </button>
          );
        })}
      </nav>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          Today's Quiz List
        </div>
        <div className="card-body">
          {loading && <div>Loading...</div>}
          {error && (
            <div
              className="review__error"
              style={{ color: "#d50000", marginTop: 8 }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(filteredReviews.length === 0 && !loading) || isFinished ? (
              <div>No quizzes to review.</div>
            ) : (
              review && (
                <div className="card review__item" key={review.id}>
                  <div className="card-body">
                    {/* From例文（空欄あり） */}
                    <div style={{ marginBottom: 8 }}>
                      <b>From:</b> {review.quiz.question}
                    </div>
                    {/* To例文訳文 */}
                    <div style={{ marginBottom: 8 }}>
                      <b>Translation:</b> {review.quiz.sentence_translation}
                    </div>
                    {/* 回答エリア */}
                    <form
                      className="review__form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAnswer(review);
                      }}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Answer"
                        value={answers[review.id] || ""}
                        onChange={(e) =>
                          setAnswers((a) => ({
                            ...a,
                            [review.id]: e.target.value,
                          }))
                        }
                        disabled={results[review.id] === true}
                        style={{ flex: 1 }}
                      />
                      <button
                        className="btn"
                        type="submit"
                        disabled={
                          updating[review.id] || results[review.id] === true
                        }
                        style={{ minWidth: 80 }}
                      >
                        Answer
                      </button>
                    </form>
                    {/* ヒントボタンとヒント表示 */}
                    <div style={{ marginBottom: 8 }}>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => handleShowHint(review.id, review.quiz)}
                        disabled={
                          !review.quiz.hint_levels ||
                          (hintIndexes[review.id] || 0) >=
                            (review.quiz.hint_levels?.length || 0)
                        }
                        style={{ minWidth: 80 }}
                      >
                        Hint
                      </button>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {review.quiz.hint_levels &&
                          review.quiz.hint_levels
                            .slice(0, hintIndexes[review.id] || 0)
                            .map((hint: string, i: number) => (
                              <li key={i}>{hint}</li>
                            ))}
                      </ul>
                    </div>
                    {/* 正誤判定と詳細ボタン＋Nextボタン */}
                    {results[review.id] !== undefined && (
                      <div style={{ marginBottom: 8 }}>
                        <div
                          className={
                            results[review.id]
                              ? "review__result--correct"
                              : "review__result--incorrect"
                          }
                        >
                          {results[review.id] ? "Correct!" : "Incorrect."}
                        </div>
                        <button
                          className="btn"
                          type="button"
                          onClick={() =>
                            setShowDetails((prev) => ({
                              ...prev,
                              [review.id]: true,
                            }))
                          }
                          style={{ marginTop: 8 }}
                        >
                          Details
                        </button>
                        <DetailsModal
                          open={!!showDetails[review.id]}
                          onClose={() =>
                            setShowDetails((prev) => ({
                              ...prev,
                              [review.id]: false,
                            }))
                          }
                          quiz={review.quiz}
                        />
                        {/* Nextボタン */}
                        <button
                          className="btn"
                          type="button"
                          style={{ marginTop: 8, marginLeft: 8 }}
                          onClick={() => {
                            setCurrentIndex((idx) => idx + 1);
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
