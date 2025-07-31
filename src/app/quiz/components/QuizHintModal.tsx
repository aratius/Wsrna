"use client";
import { useEffect } from "react";
import styles from "../quiz.module.scss";

interface QuizHintModalProps {
  review: any;
  hintIndexes: { [id: string]: number };
  showHintModal: { [id: string]: boolean };
  onShowHint: (id: string, quiz: any) => void;
  onSetShowHintModal: (
    callback: (prev: { [id: string]: boolean }) => { [id: string]: boolean }
  ) => void;
  onSetHintIndexes: (
    callback: (prev: { [id: string]: number }) => { [id: string]: number }
  ) => void;
}

export default function QuizHintModal({
  review,
  hintIndexes,
  showHintModal,
  onShowHint,
  onSetShowHintModal,
  onSetHintIndexes,
}: QuizHintModalProps) {
  // ヒントモーダル外クリックで閉じる（モバイル対応）
  useEffect(() => {
    if (!review || !showHintModal[review.id]) return;

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const popup = document.querySelector(`.${styles["quiz__hint__popup"]}`);
      const button = document.querySelector(`.${styles["quiz__hint__button"]}`);

      // ポップアップまたはボタン内のクリックは無視
      if (
        (popup && popup.contains(e.target as Node)) ||
        (button && button.contains(e.target as Node))
      ) {
        return;
      }

      onSetShowHintModal((prev) => ({ ...prev, [review.id]: false }));
    }

    // マウスとタッチイベントの両方に対応
    document.addEventListener("click", handleClickOutside, true);
    document.addEventListener("touchend", handleClickOutside, true);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("touchend", handleClickOutside, true);
    };
  }, [review, showHintModal[review?.id], onSetShowHintModal]);

  const currentHintIndex = hintIndexes[review.id] || 0;
  const totalHints = review.quiz?.hint_levels?.length || 0;
  const isLastHint = currentHintIndex >= totalHints - 1;

  const handleHintButtonClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation(); // イベントの伝播を停止

    console.log("Hint button clicked:", {
      reviewId: review.id,
      currentState: showHintModal[review.id],
    });

    if (showHintModal[review.id]) {
      // ヒントが開いている場合は閉じる
      onSetShowHintModal((prev) => ({ ...prev, [review.id]: false }));
    } else {
      // ヒントが閉じている場合は開く（ヒントを最初から表示）
      onSetHintIndexes((prev) => ({ ...prev, [review.id]: 0 }));
      onSetShowHintModal((prev) => ({ ...prev, [review.id]: true }));
    }
  };

  const handleMoreButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // イベントの伝播を停止

    console.log("More button clicked:", {
      currentHintIndex,
      totalHints,
      isLastHint,
      hintIndexes: hintIndexes[review.id],
      reviewId: review.id,
    });

    if (isLastHint) {
      // 最後のヒントの場合は閉じる
      console.log("Closing modal (last hint)");
      onSetShowHintModal((prev) => ({ ...prev, [review.id]: false }));
    } else {
      // まだヒントがある場合は次のヒントを表示
      console.log("Showing next hint");
      onShowHint(review.id, review.quiz);
    }
  };

  return (
    <div className={styles["quiz__hint__wrapper"]}>
      <button
        className={styles["quiz__hint__button"]}
        onClick={handleHintButtonClick}
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
          styles["quiz__hint__popup"] +
          (showHintModal[review.id] ? " " + styles["visible"] : "")
        }
      >
        {review.quiz?.hint_levels && review.quiz.hint_levels.length > 0 ? (
          <>
            {/* ヒントヘッダー */}
            <div className={styles["quiz__hint__header"]}>
              Hint
              <span>
                ({Math.max(1, currentHintIndex + 1)}/{totalHints})
              </span>
            </div>
            <div className={styles["quiz__hint__content"]}>
              {review.quiz?.hint_levels[hintIndexes[review.id] || 0]}
            </div>
            {/* ボタン（最後のヒントの時は「閉じる」、それ以外は「さらにヒント」） */}
            <button
              className={
                styles["quiz__hint__more-button"] +
                (isLastHint ? " " + styles[" close"] : "")
              }
              onClick={handleMoreButtonClick}
            >
              {isLastHint ? "Close" : "More"}
            </button>
          </>
        ) : (
          <div>ヒントはありません</div>
        )}
      </div>
    </div>
  );
}
