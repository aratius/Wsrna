"use client";
import { useSession } from "@supabase/auth-helpers-react";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";
import supportedLanguages from "@/lib/supportedLanguages.json";
import styles from "./quiz.module.scss";
import { useRef, useEffect, useState } from "react";

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
  const [showHintModal, setShowHintModal] = useState<{ [id: string]: boolean }>(
    {}
  );
  const [currentHintIndex, setCurrentHintIndex] = useState<{
    [id: string]: number;
  }>({});
  const hintTimers = useRef<{ [id: string]: NodeJS.Timeout }>({});
  const [attempts, setAttempts] = useState<{ [id: string]: number }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState<{ [id: string]: boolean }>({});

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
    if (!isCorrect) {
      setAttempts((prev) => ({
        ...prev,
        [review.id]: (prev[review.id] || 0) + 1,
      }));
    } else {
      setAttempts((prev) => ({ ...prev, [review.id]: 0 }));
    }
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

  // ヒントモーダル外クリックで閉じる
  useEffect(() => {
    if (!review || !showHintModal[review.id]) return;
    function handleClickOutside(e: MouseEvent) {
      const popup = document.querySelector(`.${styles.hintPopup}`);
      if (popup && !(e.target instanceof Node && popup.contains(e.target))) {
        setShowHintModal((prev) => ({ ...prev, [review.id]: false }));
      }
    }
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [review, showHintModal[review?.id]]);

  useEffect(() => {
    if (!review) return;
    // 10秒後にヒントアイコンを表示
    // if (!showHintIcon[review.id]) {
    //   if (hintTimers.current[review.id])
    //     clearTimeout(hintTimers.current[review.id]);
    //   hintTimers.current[review.id] = setTimeout(() => {
    //     setShowHintIcon((prev) => ({ ...prev, [review.id]: true }));
    //   }, 10000);
    // }
    // クリーンアップ
    return () => {
      // if (hintTimers.current[review?.id])
      //   clearTimeout(hintTimers.current[review.id]);
    };
    // eslint-disable-next-line
  }, [review?.id]);

  return (
    <div className={styles.container}>
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
            review &&
            (() => {
              // 進捗に応じた色を決定
              let progressColorClass = styles.progressBlue;
              const progressRatio = (currentIndex + 1) / filteredReviews.length;
              if (progressRatio >= 0.99) {
                progressColorClass = styles.progressGreen;
              } else if (progressRatio >= 0.7) {
                progressColorClass = styles.progressOrange;
              }
              return (
                <div
                  className={`card ${styles.quizCard} review__item`}
                  style={{ position: "relative" }}
                >
                  {/* プログレスバー */}
                  <div className={styles.quizProgressBarWrapper}>
                    <div
                      className={
                        styles.quizProgressBar + " " + progressColorClass
                      }
                      style={{ width: `${progressRatio * 100}%` }}
                    />
                  </div>
                  {/* ヒントアイコン＋モーダルラッパー */}
                  <div className={styles.hintIconWrapper}>
                    <button
                      className={styles.hintIconBtn}
                      onClick={() =>
                        setShowHintModal((prev) => ({
                          ...prev,
                          [review.id]: !prev[review.id],
                        }))
                      }
                      aria-label="Show hint"
                    >
                      <svg
                        width="22"
                        height="22"
                        fill="none"
                        stroke="#222"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 18h6" />
                        <path d="M10 22h4" />
                        <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3.5 5.5V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.5C19.5 13.5 21 11.5 21 9a7 7 0 0 0-7-7z" />
                      </svg>
                    </button>
                    {/* ヒントポップアップ（シンプルなCSS Transition） */}
                    <div
                      className={
                        styles.hintPopup +
                        (showHintModal[review.id] ? " " + styles.visible : "")
                      }
                    >
                      {review.quiz.hint_levels &&
                      review.quiz.hint_levels.length > 0 ? (
                        <>
                          <div>
                            {review.quiz.hint_levels[
                              (hintIndexes[review.id] || 0) - 1
                            ] || review.quiz.hint_levels[0]}
                          </div>
                          {/* ヒントをさらに表示するボタン（任意） */}
                          {review.quiz.hint_levels.length >
                            (hintIndexes[review.id] || 0) && (
                            <button
                              className={styles.hintMoreBtn}
                              onClick={() =>
                                handleShowHint(review.id, review.quiz)
                              }
                            >
                              さらにヒント
                            </button>
                          )}
                        </>
                      ) : (
                        <div>ヒントはありません</div>
                      )}
                    </div>
                  </div>
                  {/* Quiz部分 */}
                  <div className={styles.quizSection}>
                    <span className={styles.quizLabel}>Quiz</span>
                    <div className={styles.quizText}>
                      {(() => {
                        const answer = review.quiz.answer;
                        const attemptsCount = attempts[review.id] || 0;
                        const isCorrect = results[review.id] === true;
                        const isShowFullAnswer =
                          isCorrect ||
                          (results[review.id] === false && attemptsCount >= 3);
                        const isShowFirstChar =
                          results[review.id] === false && attemptsCount === 2;
                        const colorClass = isCorrect
                          ? styles.correctAnswer
                          : styles.incorrectAnswer;
                        const parts = review.quiz.question.split("____");
                        if (isShowFullAnswer) {
                          return (
                            <>
                              {parts[0]}
                              <span className={colorClass}>{answer}</span>
                              {parts[1]}
                            </>
                          );
                        } else if (isShowFirstChar) {
                          return (
                            <>
                              {parts[0]}
                              <span className={colorClass}>{answer[0]}</span>
                              {"_".repeat(Math.max(answer.length - 1, 0))}
                              {parts[1]}
                            </>
                          );
                        } else {
                          return review.quiz.question;
                        }
                      })()}
                    </div>
                    {review.quiz.sentence_translation && (
                      <div className={styles.translationLabel}>
                        - {review.quiz.sentence_translation}
                      </div>
                    )}
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
                        key={attempts[review.id] || 0}
                        className={
                          styles.quizFormControl +
                          " " +
                          styles.quizFormInputFlex +
                          (results[review.id] === true
                            ? " " + styles.correctInput
                            : results[review.id] === false &&
                              (attempts[review.id] || 0) > 0
                            ? " " + styles.incorrectInput
                            : "")
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
                        disabled={
                          results[review.id] === true ||
                          (results[review.id] === false &&
                            (attempts[review.id] || 0) >= 3)
                        }
                      />
                      {/* ボタン切り替えロジック */}
                      {results[review.id] === undefined ||
                      (results[review.id] === false &&
                        (attempts[review.id] || 0) < 3) ? (
                        <button
                          className={styles.quizFormBtn}
                          type="submit"
                          disabled={updating[review.id]}
                        >
                          Answer
                        </button>
                      ) : (
                        <div className={styles.quizFormBtnRow}>
                          <button
                            className={
                              styles.quizFormBtn + " " + styles.quizFormBtnHalf
                            }
                            type="button"
                            onClick={() => {
                              setCurrentIndex((idx) => idx + 1);
                            }}
                          >
                            Next
                          </button>
                        </div>
                      )}
                      {/* + Details 注釈リンクとアコーディオン（Nextボタンと同じ条件で表示） */}
                      {(results[review.id] === true ||
                        (results[review.id] === false &&
                          (attempts[review.id] || 0) >= 3)) && (
                        <div className={styles.detailsAccordionWrapper}>
                          <button
                            className={styles.detailsAccordionToggle}
                            type="button"
                            onClick={() =>
                              setDetailsOpen((prev) => ({
                                ...prev,
                                [review.id]: !prev[review.id],
                              }))
                            }
                          >
                            {detailsOpen[review.id] ? "− Details" : "+ Details"}
                          </button>
                          <div
                            className={
                              styles.detailsAccordionContent +
                              (detailsOpen[review.id] ? " " + styles.open : "")
                            }
                          >
                            {/* Main word/訳語 */}
                            {review.quiz.main_word && (
                              <div className={styles.detailsMainWordBlock}>
                                <span className={styles.detailsMainWord}>
                                  {review.quiz.main_word}
                                </span>
                                {Array.isArray(
                                  review.quiz.main_word_translations
                                ) &&
                                  review.quiz.main_word_translations.length >
                                    0 && (
                                    <span
                                      className={
                                        styles.detailsMainWordTranslation
                                      }
                                    >
                                      [
                                      {review.quiz.main_word_translations.map(
                                        (t: string, i: number) => (
                                          <span key={i}>
                                            {t}
                                            {i <
                                            review.quiz.main_word_translations
                                              .length -
                                              1
                                              ? ", "
                                              : ""}
                                          </span>
                                        )
                                      )}
                                      ]
                                    </span>
                                  )}
                              </div>
                            )}
                            {/* 例文リスト */}
                            {Array.isArray(review.quiz.example_sentences) &&
                              review.quiz.example_sentences.length > 0 && (
                                <ul className={styles.detailsExampleList}>
                                  {review.quiz.example_sentences.map(
                                    (ex: any, i: number) => (
                                      <li key={i}>
                                        <span
                                          className={
                                            styles.detailsExampleSentence
                                          }
                                        >
                                          {ex.sentence}
                                        </span>
                                        <span
                                          className={
                                            styles.detailsExampleTranslation
                                          }
                                        >
                                          - {ex.translation}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              )}
                            {/* Explanation */}
                            {review.quiz.explanation && (
                              <div className={styles.detailsExplanationBox}>
                                <span
                                  className={styles.detailsExplanationLabel}
                                >
                                  Explanation
                                </span>
                                <span>{review.quiz.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                  {/* 正誤判定と詳細ボタン＋Nextボタン */}
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
