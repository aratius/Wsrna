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
  const [dailyProgress, setDailyProgress] = useState<{ [languagePairId: string]: number }>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  // 日付を取得（朝4時リセット）
  const getCurrentDate = () => {
    const now = new Date();
    // 朝4時を基準に日付を計算
    if (now.getHours() < 4) {
      // 4時前は前日として扱う
      now.setDate(now.getDate() - 1);
    }
    return now.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  // localStorageから解答数を取得
  const getDailyProgress = (languagePairId: string) => {
    if (typeof window === "undefined") return 0;
    const date = getCurrentDate();
    const key = `quiz_daily_progress_${languagePairId}_${date}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  };

  // localStorageに解答数を保存
  const saveDailyProgress = (languagePairId: string, count: number) => {
    if (typeof window === "undefined") return;
    const date = getCurrentDate();
    const key = `quiz_daily_progress_${languagePairId}_${date}`;
    localStorage.setItem(key, count.toString());
  };

    const handleAnswer = async (review: any, languagePairId: string) => {
    const quiz = review.quiz;
    const userAnswer = answers[review.id]?.trim();
    if (!userAnswer) return;

    // 重複回答を防ぐ（正解の場合のみ）
    const isCorrect = userAnswer === quiz.answer;
    if (isCorrect && answeredQuestions.has(review.id)) {
      console.log('Question already answered correctly:', review.id);
      return;
    }

    // デバッグ: 重複呼び出しチェック
    console.log('handleAnswer called:', { reviewId: review.id, userAnswer, isCorrect });

    // 正解の場合のみ回答済みフラグを設定
    if (isCorrect) {
      setAnsweredQuestions(prev => new Set(prev).add(review.id));
    }
    setResults((prev) => ({ ...prev, [review.id]: isCorrect }));
    setUpdating((prev) => ({ ...prev, [review.id]: true }));

    let attemptsCount = 0;
    if (!isCorrect) {
      attemptsCount = (attempts[review.id] || 0) + 1;
      setAttempts((prev) => ({
        ...prev,
        [review.id]: attemptsCount,
      }));
    } else {
      setAttempts((prev) => ({ ...prev, [review.id]: 0 }));
    }

    // 確定条件: 正解 OR 3回間違えて不正解確定
    const isDetermined = isCorrect || attemptsCount >= 3;

    if (isDetermined) {
      console.log('Question determined, calling review-update API:', {
        reviewId: review.id,
        isCorrect,
        attemptsCount,
        isDetermined
      });

      await fetch("/api/review-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: review.user_id,
          quiz_id: review.quiz_id,
          correct: isCorrect,
        }),
      });
    } else {
      console.log('Question not determined yet, skipping review-update API:', {
        reviewId: review.id,
        isCorrect,
        attemptsCount,
        isDetermined
      });
    }

    setUpdating((prev) => ({ ...prev, [review.id]: false }));

    // 解答数を更新（正解の場合のみ）
    if (isCorrect) {
      const currentProgress = getDailyProgress(languagePairId);
      const newProgress = currentProgress + 1;
      console.log('Progress update (correct answer):', { languagePairId, currentProgress, newProgress });
      saveDailyProgress(languagePairId, newProgress);
      setDailyProgress((prev) => ({ ...prev, [languagePairId]: newProgress }));
    } else {
      console.log('Progress not updated (incorrect answer):', { languagePairId, isCorrect });
    }
  };

  const handleShowHint = (id: string, quiz: any) => {
    console.log('handleShowHint called:', {
      id,
      currentIndex: hintIndexes[id] || 0,
      totalHints: quiz.hint_levels?.length || 0,
      hintLevels: quiz.hint_levels
    });

    setHintIndexes((prev) => {
      const current = prev[id] || 0;
      const newIndex = current + 1;
      console.log('Updating hint index:', { id, current, newIndex });

      if (quiz.hint_levels && current < quiz.hint_levels.length - 1) {
        return { ...prev, [id]: newIndex };
      }
      return prev;
    });
  };

  const handleNext = () => {
    setCurrentIndex((idx) => idx + 1);
  };

  // 古いlocalStorageデータのクリーンアップ
  const cleanupOldProgress = () => {
    if (typeof window === "undefined") return;

    const currentDate = getCurrentDate();
    const keys = Object.keys(localStorage);

    keys.forEach(key => {
      if (key.startsWith('quiz_daily_progress_')) {
        const keyDate = key.split('_').pop(); // 最後の部分が日付
        if (keyDate && keyDate !== currentDate) {
          localStorage.removeItem(key);
          console.log('Cleaned up old progress:', key);
        }
      }
    });
  };

  // タブ切り替え時にcurrentIndexリセット
  useEffect(() => {
    setCurrentIndex(0);
    setAnsweredQuestions(new Set()); // 回答済みフラグもリセット
    cleanupOldProgress(); // 古いデータをクリーンアップ
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
    dailyProgress,
    getDailyProgress,
    handleAnswer,
    handleShowHint,
    handleNext,
  };
}