import { useState, useEffect, useRef } from "react";

export function useQuizState() {
  const [answers, setAnswers] = useState<{ [id: string]: string; }>({});
  const [results, setResults] = useState<{ [id: string]: boolean | null; }>({});
  const [updating, setUpdating] = useState<{ [id: string]: boolean; }>({});
  const [hintIndexes, setHintIndexes] = useState<{ [id: string]: number; }>({});
  const [showHintModal, setShowHintModal] = useState<{ [id: string]: boolean; }>({});
  const [currentHintIndex, setCurrentHintIndex] = useState<{ [id: string]: number; }>({});
  const hintTimers = useRef<{ [id: string]: NodeJS.Timeout; }>({});
  const [attempts, setAttempts] = useState<{ [id: string]: number; }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState<{ [id: string]: boolean; }>({});

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

  const handleNext = () => {
    setCurrentIndex((idx) => idx + 1);
  };

  // タブ切り替え時にcurrentIndexリセット
  useEffect(() => {
    setCurrentIndex(0);
  }, []);

  return {
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
    handleAnswer,
    handleShowHint,
    handleNext,
  };
}