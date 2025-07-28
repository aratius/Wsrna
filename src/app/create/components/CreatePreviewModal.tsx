import React from "react";
import styles from "../create.module.scss";

export interface CreatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  quizzes: any[];
  onSubmit: () => void;
  submitting: boolean;
}

const CreatePreviewModal: React.FC<CreatePreviewModalProps> = ({
  open,
  onClose,
  quizzes,
  onSubmit,
  submitting,
}) => {
  if (!open) return null;
  return (
    <div className={styles["create__preview__overlay"]}>
      <div className={styles["create__preview__card"]}>
        <h2 className={styles["create__preview__title"]}>Quiz Preview</h2>
        <ul className={styles["create__preview__quiz__list"]}>
          {quizzes.map((q: any, idx: number) => (
            <li key={idx} className={styles["create__preview__quiz__item"]}>
              {q.main_word && (
                <div
                  className={styles["create__preview__quiz__main-word__block"]}
                >
                  <span
                    className={styles["create__preview__quiz__main-word__text"]}
                  >
                    {q.main_word}
                  </span>
                  {Array.isArray(q.main_word_translations) &&
                    q.main_word_translations.length > 0 && (
                      <span
                        className={
                          styles[
                            "create__preview__quiz__main-word__translations"
                          ]
                        }
                      >
                        [
                        {q.main_word_translations.map(
                          (t: string, i: number) => (
                            <span key={i}>
                              {t}
                              {i < q.main_word_translations.length - 1
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
              {/* Quiz, Answer, Translation, Explanation をカードでラップ */}
              <div className={styles["create__preview__quiz__content"]}>
                {/* Quiz部分 */}
                <div className={styles["create__preview__quiz__section"]}>
                  <span
                    className={
                      styles["create__preview__quiz__label"] +
                      " " +
                      styles["create__preview__quiz__label--quiz"]
                    }
                  >
                    Quiz
                  </span>
                  <div className={styles["create__preview__quiz__text"]}>
                    {q.question}
                  </div>
                </div>
                {/* Answer部分 */}
                <div className={styles["create__preview__quiz__section"]}>
                  <span
                    className={
                      styles["create__preview__quiz__label"] +
                      " " +
                      styles["create__preview__quiz__label--answer"]
                    }
                  >
                    Answer
                  </span>
                  <div className={styles["create__preview__quiz__text"]}>
                    {q.answer}
                  </div>
                </div>
                {/* Translation部分 */}
                <div className={styles["create__preview__quiz__section"]}>
                  <span
                    className={
                      styles["create__preview__quiz__label"] +
                      " " +
                      styles["create__preview__quiz__label--translation"]
                    }
                  >
                    Translation
                  </span>
                  <div className={styles["create__preview__quiz__text"]}>
                    {q.sentence_translation}
                  </div>
                </div>
                {/* Explanation部分 */}
                {q.explanation && (
                  <div className={styles["create__preview__quiz__explanation"]}>
                    {q.explanation}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className={styles["create__preview__footer"]}>
          <div className={styles["create__preview__footer__buttons"]}>
            <button
              className={
                styles["create__preview__button"] +
                " " +
                styles["create__preview__button--close"]
              }
              onClick={onClose}
            >
              Close
            </button>
            <button
              className={
                styles["create__preview__button"] +
                " " +
                styles["create__preview__button--submit"]
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

export default CreatePreviewModal;
