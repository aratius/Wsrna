"use client";
import { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";
import supportedLanguages from "@/lib/supportedLanguages.json";
import styles from "./quiz.module.scss";
import DetailsModal from "@/components/DetailsModal";

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
    <div className={`card ${styles.container}`}>
      <div className={`card ${styles.cardMargin}`}>
        <div className={styles.gradientText}>Today's Quiz List</div>
        <div className={`card-header ${styles.cardHeaderMargin}`}></div>
        <div className="card-body">
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
          {/* クイズリスト本体 */}
          <div className={styles.quizList}>
            {(filteredReviews.length === 0 && !loading) || isFinished ? (
              <div>No quizzes to review.</div>
            ) : (
              review && (
                <div
                  className={`card ${styles.quizCard} review__item`}
                  key={review.id}
                >
                  {/* Quiz部分 */}
                  <div className={styles.quizSection}>
                    <span className={styles.quizLabel}>Quiz</span>
                    <div className={styles.quizText}>
                      {review.quiz.question}
                    </div>
                  </div>
                  {/* Answer部分 */}
                  <div className={styles.quizSection}>
                    <span className={styles.answerLabel}>Answer</span>
                    <form
                      className={styles.quizForm}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAnswer(review);
                      }}
                    >
                      <input
                        id={`answer-${review.id}`}
                        className={
                          styles.quizFormControl +
                          " " +
                          styles.quizFormInputFlex
                        }
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
                      />
                      <button
                        className={styles.quizFormBtn}
                        type="submit"
                        disabled={
                          updating[review.id] || results[review.id] === true
                        }
                      >
                        Answer
                      </button>
                    </form>
                  </div>
                  {/* 正誤判定と詳細ボタン＋Nextボタン */}
                  {results[review.id] !== undefined && (
                    <div className={styles.quizSection}>
                      <div
                        className={
                          results[review.id] ? styles.correct : styles.incorrect
                        }
                      >
                        {results[review.id] ? "Correct!" : "Incorrect."}
                      </div>
                      <button
                        className={styles.quizFormBtn}
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
                        className={styles.quizFormBtn}
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
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
