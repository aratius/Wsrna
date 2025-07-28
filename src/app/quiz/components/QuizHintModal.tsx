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
  // ヒントモーダル外クリックで閉じる
  useEffect(() => {
    if (!review || !showHintModal[review.id]) return;

    function handleClickOutside(e: MouseEvent) {
      const popup = document.querySelector(`.${styles["quiz__hint__popup"]}`);
      if (popup && !(e.target instanceof Node && popup.contains(e.target))) {
        onSetShowHintModal((prev) => ({ ...prev, [review.id]: false }));
      }
    }

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [review, showHintModal[review?.id], onSetShowHintModal]);

  const currentHintIndex = hintIndexes[review.id] || 0;
  const totalHints = review.quiz.hint_levels?.length || 0;
  const isLastHint = currentHintIndex >= totalHints;

  const handleHintButtonClick = () => {
    if (showHintModal[review.id]) {
      // ヒントが開いている場合は閉じる
      onSetShowHintModal((prev) => ({ ...prev, [review.id]: false }));
    } else {
      // ヒントが閉じている場合は開く（ヒントを最初から表示）
      onSetHintIndexes((prev) => ({ ...prev, [review.id]: 0 }));
      onSetShowHintModal((prev) => ({ ...prev, [review.id]: true }));
    }
  };

  const handleMoreButtonClick = () => {
    if (isLastHint) {
      // 最後のヒントの場合は閉じる
      onSetShowHintModal((prev) => ({ ...prev, [review.id]: false }));
    } else {
      // まだヒントがある場合は次のヒントを表示
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
          (showHintModal[review.id]
            ? " " + styles["quiz__hint__popup"] + "--visible"
            : "")
        }
      >
        {review.quiz.hint_levels && review.quiz.hint_levels.length > 0 ? (
          <>
            <div>
              {review.quiz.hint_levels[(hintIndexes[review.id] || 0) - 1] ||
                review.quiz.hint_levels[0]}
            </div>
            {/* ボタン（最後のヒントの時は「閉じる」、それ以外は「さらにヒント」） */}
            <button
              className={styles["quiz__hint__more-button"]}
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
