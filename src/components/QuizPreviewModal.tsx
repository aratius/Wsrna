import React from "react";
import styles from "./QuizPreviewModal.module.scss";

export interface QuizPreviewModalProps {
  open: boolean;
  onClose: () => void;
  quizzes: any[];
  onSubmit: () => void;
  submitting: boolean;
}

const QuizPreviewModal: React.FC<QuizPreviewModalProps> = ({
  open,
  onClose,
  quizzes,
  onSubmit,
  submitting,
}) => {
  if (!open) return null;
  return (
    <div className={styles.quiz_preview_modal__overlay}>
      <div className={styles.quiz_preview_modal__card}>
        <h2 className={styles.quiz_preview_modal__title}>Quiz Preview</h2>
        {quizzes.map((q: any, idx: number) => (
          <div key={idx} className={styles.quiz_preview_modal__quiz__card}>
            {q.main_word && (
              <div
                className={styles.quiz_preview_modal__quiz__main_word__block}
              >
                <span
                  className={styles.quiz_preview_modal__quiz__main_word__text}
                >
                  {q.main_word}
                </span>
                {Array.isArray(q.main_word_translations) &&
                  q.main_word_translations.length > 0 && (
                    <span
                      className={
                        styles.quiz_preview_modal__quiz__main_word__translations
                      }
                    >
                      [
                      {q.main_word_translations.map((t: string, i: number) => (
                        <span key={i}>
                          {t}
                          {i < q.main_word_translations.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      ]
                    </span>
                  )}
              </div>
            )}
            {/* Quiz, Answer, Translation, Explanation をカードでラップ */}
            <div className={styles.quiz_preview_modal__quiz__content}>
              {/* Quiz部分 */}
              <div className={styles.quiz_preview_modal__quiz__section}>
                <span className={styles.quiz_preview_modal__quiz__label}>
                  Quiz
                </span>
                <div className={styles.quiz_preview_modal__quiz__text}>
                  {q.question}
                </div>
              </div>
              {/* Answer部分 */}
              <div className={styles.quiz_preview_modal__quiz__section}>
                <span className={styles.quiz_preview_modal__quiz__label}>
                  Answer
                </span>
                <div className={styles.quiz_preview_modal__quiz__text}>
                  {q.answer}
                </div>
              </div>
              {/* Translation部分 */}
              <div className={styles.quiz_preview_modal__quiz__section}>
                <span className={styles.quiz_preview_modal__quiz__label}>
                  Translation
                </span>
                <div className={styles.quiz_preview_modal__quiz__text}>
                  {q.sentence_translation}
                </div>
              </div>
              {/* Explanation部分 */}
              {q.explanation && (
                <div className={styles.quiz_preview_modal__quiz__explanation}>
                  {q.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
        <div className={styles.quiz_preview_modal__footer}>
          <div className={styles.quiz_preview_modal__footer__spacer} />
          <div className={styles.quiz_preview_modal__footer__buttons}>
            <button
              className={
                styles.quiz_preview_modal__button +
                " " +
                styles.quiz_preview_modal__button +
                "--close"
              }
              onClick={onClose}
            >
              Close
            </button>
            <button
              className={
                styles.quiz_preview_modal__button +
                " " +
                styles.quiz_preview_modal__button +
                "--submit"
              }
              onClick={onSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreviewModal;
