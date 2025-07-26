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
    showHintModal,
    setShowHintModal,
    attempts,
    currentIndex,
    setCurrentIndex,
    detailsOpen,
    setDetailsOpen,
    handleAnswer,
    handleShowHint,
    handleNext,
  } = useQuizState();

  // 選択中のLanguage Pairのクイズのみ表示
  const filteredReviews = selectedPairId
    ? reviews.filter((r) => r.quiz?.language_pair_id === selectedPairId)
    : reviews;

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

  // タブ切り替え時にcurrentIndexリセット
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedPairId, setCurrentIndex]);

  return (
    <div className={styles["quiz"]}>
      <div className={styles["quiz__container"]}>
        <h1 className={styles["quiz__title"]}>Today's Quiz !!</h1>

        <QuizTab
          languagePairs={languagePairs}
          selectedPairId={selectedPairId}
          onSelectPair={setSelectedPairId}
        />

        <div className={styles["quiz__content"]}>
          {(filteredReviews.length === 0 && !loading) || isFinished ? (
            <div>No quizzes to review.</div>
          ) : (
            review && (
              <QuizCard
                review={review}
                currentIndex={currentIndex}
                totalCount={filteredReviews.length}
                answers={answers}
                results={results}
                attempts={attempts}
                updating={updating}
                hintIndexes={hintIndexes}
                showHintModal={showHintModal}
                detailsOpen={detailsOpen}
                onAnswer={handleAnswer}
                onShowHint={handleShowHint}
                onSetShowHintModal={setShowHintModal}
                onSetDetailsOpen={setDetailsOpen}
                onSetAnswers={setAnswers}
                onNext={handleNext}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
