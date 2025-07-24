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
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <h2 className={styles.modalTitle + " " + styles.gradientText}>
          Quiz Preview
        </h2>
        {quizzes.map((q: any, idx: number) => (
          <div key={idx} className={styles.quizCard}>
            {q.main_word && (
              <div className={styles.mainWordBlock}>
                <span className={styles.mainWord}>{q.main_word}</span>
                {Array.isArray(q.main_word_translations) &&
                  q.main_word_translations.length > 0 && (
                    <span className={styles.translations}>
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
            <div className={styles.quizInnerCard}>
              {/* Quiz部分 */}
              <div className={styles.quizSection}>
                <span className={styles.quizLabel}>Quiz</span>
                <div className={styles.quizText}>{q.question}</div>
              </div>
              {/* Answer部分 */}
              <div className={styles.quizSection}>
                <span className={styles.answerLabel}>Answer</span>
                <div className={styles.quizText}>{q.answer}</div>
              </div>
              {/* Translation部分 */}
              <div className={styles.quizSection}>
                <span className={styles.translationLabel}>Translation</span>
                <div className={styles.quizText}>{q.sentence_translation}</div>
              </div>
              {/* Explanation部分 */}
              {q.explanation && (
                <div className={styles.explanationBox}>{q.explanation}</div>
              )}
            </div>
          </div>
        ))}
        <div className={styles.modalFooter}>
          <div className={styles.modalFooterSpacer} />
          <div className={styles.modalFooterBtns}>
            <button className={styles.closeBtn} onClick={onClose}>
              Close
            </button>
            <button
              className={styles.submitBtn}
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
