import { useState, useEffect, useRef } from "react";
import { playNotification, playError } from "../../../lib/soundManager";

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

  // その日の利用可能なクイズ数を取得（最大10問、実際のクイズ数が少ない場合はその数）
  const getDailyQuizLimit = (languagePairId: string, availableQuizzes: number) => {
    return Math.min(10, availableQuizzes);
  };

  // localStorageに解答数を保存
  const saveDailyProgress = (languagePairId: string, count: number) => {
    if (typeof window === "undefined") return;
    const date = getCurrentDate();
    const key = `quiz_daily_progress_${languagePairId}_${date}`;
    localStorage.setItem(key, count.toString());
  };

  const handleAnswer = async (idiom: any, languagePairId: string) => {
    const quiz = idiom.quiz;
    const userAnswer = answers[idiom.id]?.trim();
    if (!userAnswer) return;

    // 重複回答を防ぐ（正解の場合のみ）
    const isCorrect = userAnswer.toLowerCase() === quiz.answer.toLowerCase();
    if (isCorrect && answeredQuestions.has(idiom.id)) {
      console.log('Question already answered correctly:', idiom.id);
      return;
    }

    if (isCorrect) {
      setAnsweredQuestions(prev => new Set(prev).add(idiom.id));
      // 正解時にNotification音を再生
      playNotification();
    } else {
      // 不正解時にCaution音を再生
      playError();
    }
    setResults((prev) => ({ ...prev, [idiom.id]: isCorrect }));
    setUpdating((prev) => ({ ...prev, [idiom.id]: true }));

    let attemptsCount = 0;
    if (!isCorrect) {
      attemptsCount = (attempts[idiom.id] || 0) + 1;
      setAttempts((prev) => ({
        ...prev,
        [idiom.id]: attemptsCount,
      }));
    } else {
      setAttempts((prev) => ({ ...prev, [idiom.id]: 0 }));
    }

    // 確定条件: 正解 OR 3回間違えて不正解確定
    const isDetermined = isCorrect || attemptsCount >= 3;

    if (isDetermined) {
      await fetch("/api/idiom-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: idiom.user_id,
          idiom_id: idiom.id,
          correct: isCorrect,
        }),
      });
    } else {
    }

    setUpdating((prev) => ({ ...prev, [idiom.id]: false }));

    // カウントアップはNextボタン押下時に行うため、ここでは行わない
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

  const handleNext = (languagePairId?: string) => {
    // Nextボタン押下時にカウントアップ
    if (languagePairId) {
      const currentProgress = getDailyProgress(languagePairId);
      const newProgress = currentProgress + 1;
      saveDailyProgress(languagePairId, newProgress);
      setDailyProgress((prev) => ({ ...prev, [languagePairId]: newProgress }));
    }

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
    getDailyQuizLimit,
    handleAnswer,
    handleShowHint,
    handleNext,
  };
}