"use client";
import styles from "../quiz.module.scss";

interface QuizHintModalProps {
  review: any;
  hintIndexes: { [id: string]: number };
  showHintModal: { [id: string]: boolean };
  onShowHint: (id: string, quiz: any) => void;
  onSetShowHintModal: (
    callback: (prev: { [id: string]: boolean }) => { [id: string]: boolean }
  ) => void;
}

export default function QuizHintModal({
  review,
  hintIndexes,
  showHintModal,
  onShowHint,
  onSetShowHintModal,
}: QuizHintModalProps) {
  return (
    <div className={styles["quiz__hint__wrapper"]}>
      <button
        className={styles["quiz__hint__button"]}
        onClick={() =>
          onSetShowHintModal((prev) => ({
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
            {/* ヒントをさらに表示するボタン（任意） */}
            {review.quiz.hint_levels.length > (hintIndexes[review.id] || 0) && (
              <button
                className={styles["quiz__hint__more_button"]}
                onClick={() => onShowHint(review.id, review.quiz)}
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
  );
}
