"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";
import supportedLanguages from "@/lib/supportedLanguages.json";
import styles from "./quiz.module.scss";

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
    <div className={styles.container}>
      {/* タブUI */}
      <nav className={styles.tabNav + " tab-scrollbar"}>
        {languagePairs.map((lp) => {
          const active = selectedPairId === lp.id;
          return (
            <button
              key={lp.id}
              onClick={() => setSelectedPairId(lp.id)}
              className={
                styles.tabButton + (active ? " " + styles.activeTab : "")
              }
            >
              {(lp.from_lang || "").toUpperCase()}
              <span className={styles.tabArrow}>›</span>
              {(lp.to_lang || "").toUpperCase()}
            </button>
          );
        })}
      </nav>
      <div className={`card ${styles.cardMargin}`}>
        <div className={`card-header ${styles.cardHeaderMargin}`}>
          Today's Quiz List
        </div>
        <div className="card-body">
          {loading && <div>Loading...</div>}
          {error && (
            <div className={`review__error ${styles.error}`}>{error}</div>
          )}
          <div className={styles.quizList}>
            {(filteredReviews.length === 0 && !loading) || isFinished ? (
              <div>No quizzes to review.</div>
            ) : (
              review && (
                <div className={`card review__item`} key={review.id}>
                  <div className="card-body">
                    {/* From例文 */}
                    <div className={styles.quizSection}>
                      <b>From:</b> {review.quiz.question}
                    </div>
                    {/* To例文訳文 */}
                    <div className={styles.quizSection}>
                      <b>Translation:</b> {review.quiz.sentence_translation}
                    </div>
                    {/* 回答エリア */}
                    <form
                      className={`review__form ${styles.answerForm}`}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAnswer(review);
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
                        className={`btn ${styles.answerBtn}`}
                        type="submit"
                        disabled={
                          updating[review.id] || results[review.id] === true
                        }
                      >
                        Answer
                      </button>
                    </form>
                    {/* ヒントボタンとヒント表示 */}
                    <div className={styles.quizSection}>
                      <button
                        className={`btn ${styles.hintBtn}`}
                        type="button"
                        onClick={() => handleShowHint(review.id, review.quiz)}
                        disabled={
                          !review.quiz.hint_levels ||
                          (hintIndexes[review.id] || 0) >=
                            (review.quiz.hint_levels?.length || 0)
                        }
                      >
                        Hint
                      </button>
                      <ul className={styles.hintList}>
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
                      <div className={styles.quizSection}>
                        <div
                          className={
                            results[review.id]
                              ? styles.correct
                              : styles.incorrect
                          }
                        >
                          {results[review.id] ? "Correct!" : "Incorrect."}
                        </div>
                        <button
                          className={`btn ${styles.detailsBtn}`}
                          type="button"
                          onClick={() =>
                            setShowDetails((prev) => ({
                              ...prev,
                              [review.id]: true,
                            }))
                          }
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
                          className={`btn ${styles.nextBtn}`}
                          type="button"
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
