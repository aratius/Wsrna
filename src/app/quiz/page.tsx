"use client";
import "@/styles/components/_button.scss";
import "@/styles/components/_form.scss";
import "@/styles/components/_card.scss";
import styles from "./quiz.module.scss";
import { useEffect } from "react";
import { useQuizData } from "./hooks/useQuizData";
import { useQuizState } from "./hooks/useQuizState";
import QuizTab from "./components/QuizTab";
import QuizCard from "./components/QuizCard";
import { motion } from "framer-motion";
import {
  AnimatedQuizContent,
  AnimatedQuizCard,
  AnimatedQuizTab,
  AnimatedCompletionMessage,
} from "./components/AnimatedQuizContent";

export default function QuizPage() {
  const {
    reviews,
    languagePairs,
    selectedPairId,
    setSelectedPairId,
    loading,
    error,
  } = useQuizData();

  const {
    answers,
    setAnswers,
    results,
    updating,
    hintIndexes,
    setHintIndexes,
    showHintModal,
    setShowHintModal,
    attempts,
    currentIndex,
    setCurrentIndex,
    detailsOpen,
    setDetailsOpen,
    dailyProgress,
    getDailyProgress,
    getDailyQuizLimit,
    handleAnswer,
    handleShowHint,
    handleNext,
  } = useQuizState();

  // API側でフィルタリング済みのため、そのまま使用
  const filteredReviews = reviews;

  // 1問ずつ表示するロジック
  const review = filteredReviews[currentIndex];

  // 動的なクイズ制限の確認（localStorageの解答数に基づく）
  const currentDailyProgress = selectedPairId
    ? getDailyProgress(selectedPairId)
    : 0;
  const dailyQuizLimit = selectedPairId
    ? getDailyQuizLimit(selectedPairId, filteredReviews.length)
    : 10;
  const isDailyLimitReached = currentDailyProgress >= dailyQuizLimit;

  // 終了条件: 問題がない OR 全問完了 OR 10問制限到達
  const isFinished =
    filteredReviews.length > 0 &&
    (currentIndex >= filteredReviews.length || isDailyLimitReached);

  // タブ切り替え時にcurrentIndexリセット
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedPairId, setCurrentIndex]);

  return (
    <motion.div
      className={styles["quiz"]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles["quiz__container"]}>
        <motion.h1
          className={styles["quiz__title"]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          Today's Quiz !!
        </motion.h1>

        <AnimatedQuizTab delay={0.1}>
          <QuizTab
            languagePairs={languagePairs}
            selectedPairId={selectedPairId}
            onSelectPair={setSelectedPairId}
          />
        </AnimatedQuizTab>

        {/* 今日の進捗表示 */}
        {selectedPairId && dailyQuizLimit > 0 && (
          <motion.div
            className={styles["quiz__progress"]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <span>
              Today's Progress: {currentDailyProgress}/{dailyQuizLimit}{" "}
              questions
            </span>
            {isDailyLimitReached && (
              <span
                style={{
                  color: "#34c759",
                  fontWeight: "bold",
                  marginLeft: "8px",
                }}
              >
                ✓ Complete
              </span>
            )}
          </motion.div>
        )}

        <AnimatedQuizContent
          isLoading={loading}
          className={styles["quiz__content"]}
        >
          {(filteredReviews.length === 0 && !loading) || isFinished ? (
            <AnimatedCompletionMessage>
              <div className={styles["quiz__no-quizzes"]}>
                {isDailyLimitReached && dailyQuizLimit > 0 ? (
                  <div>
                    <h3>🎉 Today's Learning Complete!</h3>
                    <p>
                      You've completed {dailyQuizLimit} questions. Great job!
                    </p>
                    <p>Keep up the good work tomorrow!</p>
                    <button
                      className={styles["quiz__reset-button"]}
                      onClick={() => {
                        if (selectedPairId) {
                          const date = new Date();
                          if (date.getHours() < 4) {
                            date.setDate(date.getDate() - 1);
                          }
                          const key = `quiz_daily_progress_${selectedPairId}_${date
                            .toISOString()
                            .slice(0, 10)}`;
                          localStorage.setItem(key, "0");
                          window.location.reload();
                        }
                      }}
                    >
                      10 More Quizzes !!
                    </button>
                  </div>
                ) : (
                  <div>
                    <p>No quizzes to review.</p>
                    <button
                      className={styles["quiz__create-button"]}
                      onClick={() =>
                        (window.location.href = `/create?lang_pair=${selectedPairId}`)
                      }
                    >
                      Create New Quizzes
                    </button>
                  </div>
                )}
              </div>
            </AnimatedCompletionMessage>
          ) : (
            review && (
              <AnimatedQuizCard delay={0.05}>
                <QuizCard
                  review={review}
                  currentIndex={currentIndex}
                  totalCount={Math.min(filteredReviews.length, 10)}
                  answers={answers}
                  results={results}
                  attempts={attempts}
                  updating={updating}
                  hintIndexes={hintIndexes}
                  showHintModal={showHintModal}
                  detailsOpen={detailsOpen}
                  dailyProgress={currentDailyProgress}
                  dailyQuizLimit={dailyQuizLimit}
                  onAnswer={(review) => handleAnswer(review, selectedPairId)}
                  onShowHint={handleShowHint}
                  onSetShowHintModal={setShowHintModal}
                  onSetDetailsOpen={setDetailsOpen}
                  onSetAnswers={setAnswers}
                  onNext={() => handleNext(selectedPairId)}
                  onSetHintIndexes={setHintIndexes}
                />
              </AnimatedQuizCard>
            )
          )}
        </AnimatedQuizContent>
      </div>
    </motion.div>
  );
}
