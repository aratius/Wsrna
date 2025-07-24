import React from "react";
import styles from "../app/quiz/quiz.module.scss";

export interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  quiz: any;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ open, onClose, quiz }) => {
  if (!open || !quiz) return null;
  return (
    <div className={styles.detailsModalOverlay}>
      <div className={styles.detailsModalCard}>
        <h2 className={styles.detailsModalTitle}>Details</h2>
        {quiz.main_word && (
          <div className={styles.detailsModalMainWord}>
            <b>Main word:</b> {quiz.main_word}
            {Array.isArray(quiz.main_word_translations) &&
              quiz.main_word_translations.length > 0 && (
                <span className={styles.detailsModalMainWordTranslation}>
                  [
                  {quiz.main_word_translations.map((t: string, i: number) => (
                    <span key={i}>
                      {t}
                      {i < quiz.main_word_translations.length - 1 ? ", " : ""}
                    </span>
                  ))}
                  ]
                </span>
              )}
          </div>
        )}
        {quiz.explanation && (
          <div className={styles.detailsModalExplanation}>
            <b>Explanation:</b> {quiz.explanation}
          </div>
        )}
        <button
          className={styles.detailsModalCloseBtn + " btn"}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DetailsModal;
