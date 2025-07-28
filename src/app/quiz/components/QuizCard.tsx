"use client";
import { useState } from "react";
import styles from "../quiz.module.scss";
import QuizHintModal from "./QuizHintModal";

interface QuizCardProps {
  review: any;
  currentIndex: number;
  totalCount: number;
  answers: { [id: string]: string };
  results: { [id: string]: boolean | null };
  attempts: { [id: string]: number };
  updating: { [id: string]: boolean };
  hintIndexes: { [id: string]: number };
  showHintModal: { [id: string]: boolean };
  detailsOpen: { [id: string]: boolean };
  onAnswer: (review: any) => void;
  onShowHint: (id: string, quiz: any) => void;
  onSetShowHintModal: (
    callback: (prev: { [id: string]: boolean }) => { [id: string]: boolean }
  ) => void;
  onSetDetailsOpen: (
    callback: (prev: { [id: string]: boolean }) => { [id: string]: boolean }
  ) => void;
  onSetAnswers: (
    callback: (prev: { [id: string]: string }) => { [id: string]: string }
  ) => void;
  onNext: () => void;
  onSetHintIndexes: (
    callback: (prev: { [id: string]: number }) => { [id: string]: number }
  ) => void;
}

export default function QuizCard({
  review,
  currentIndex,
  totalCount,
  answers,
  results,
  attempts,
  updating,
  hintIndexes,
  showHintModal,
  detailsOpen,
  onAnswer,
  onShowHint,
  onSetShowHintModal,
  onSetDetailsOpen,
  onSetAnswers,
  onNext,
  onSetHintIndexes,
}: QuizCardProps) {
  // 進捗に応じた色を決定
  let progressColorClass = "";
  const progressRatio = (currentIndex + 1) / totalCount;
  if (progressRatio >= 0.99) {
    progressColorClass = "green";
  } else if (progressRatio >= 0.7) {
    progressColorClass = "orange";
  }

  return (
    <div className={styles["quiz__card"]}>
      {/* プログレスバー */}
      <div className={styles["quiz__progress__wrapper"]}>
        <div
          className={
            styles["quiz__progress__bar"] +
            (progressColorClass === "green"
              ? " " + styles["quiz__progress__bar"] + "--green"
              : progressColorClass === "orange"
              ? " " + styles["quiz__progress__bar"] + "--orange"
              : "")
          }
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* ヒントモーダル */}
      <QuizHintModal
        review={review}
        hintIndexes={hintIndexes}
        showHintModal={showHintModal}
        onShowHint={onShowHint}
        onSetShowHintModal={onSetShowHintModal}
        onSetHintIndexes={onSetHintIndexes}
      />

      {/* Quiz部分 */}
      <div className={styles["quiz__section"]}>
        <span
          className={
            styles.quiz__section__label +
            " " +
            styles.quiz__section__label +
            "--quiz"
          }
        >
          Quiz
        </span>
        <div className={styles["quiz__section__text"]}>
          {(() => {
            const answer = review.quiz.answer;
            const attemptsCount = attempts[review.id] || 0;
            const isCorrect = results[review.id] === true;
            const isShowFullAnswer =
              isCorrect || (results[review.id] === false && attemptsCount >= 3);
            const isShowFirstChar =
              results[review.id] === false && attemptsCount === 2;
            const colorClass = isCorrect
              ? styles["quiz__answer"] + "--correct"
              : styles["quiz__answer"] + "--incorrect";
            const parts = review.quiz.question.split("____");
            if (isShowFullAnswer) {
              return (
                <>
                  {parts[0]}
                  <span className={colorClass}>{answer}</span>
                  {parts[1]}
                </>
              );
            } else if (isShowFirstChar) {
              return (
                <>
                  {parts[0]}
                  <span className={colorClass}>{answer[0]}</span>
                  {"_".repeat(Math.max(answer.length - 1, 0))}
                  {parts[1]}
                </>
              );
            } else {
              return review.quiz.question;
            }
          })()}
        </div>
        {review.quiz.sentence_translation && (
          <div className={styles["quiz__section__translation"]}>
            - {review.quiz.sentence_translation}
          </div>
        )}
      </div>

      {/* Answer部分 */}
      <div className={styles["quiz__section"]}>
        <span
          className={
            styles.quiz__section__label +
            " " +
            styles.quiz__section__label +
            "--answer"
          }
        >
          Answer
        </span>
        <form
          className={styles["quiz__form"]}
          onSubmit={(e) => {
            e.preventDefault();
            onAnswer(review);
          }}
        >
          <input
            id={`answer-${review.id}`}
            key={attempts[review.id] || 0}
            className={
              styles["quiz__form__control"] +
              " " +
              styles["quiz__form__control"] +
              "--flex" +
              (results[review.id] === true
                ? " " + styles["quiz__form__control"] + "--correct"
                : results[review.id] === false && (attempts[review.id] || 0) > 0
                ? " " + styles["quiz__form__control"] + "--incorrect"
                : "")
            }
            type="text"
            placeholder="Answer"
            value={answers[review.id] || ""}
            onChange={(e) =>
              onSetAnswers((a) => ({
                ...a,
                [review.id]: e.target.value,
              }))
            }
            disabled={
              results[review.id] === true ||
              (results[review.id] === false && (attempts[review.id] || 0) >= 3)
            }
          />
          {/* ボタン切り替えロジック */}
          {results[review.id] === undefined ||
          (results[review.id] === false && (attempts[review.id] || 0) < 3) ? (
            <button
              className={styles["quiz__form__button"]}
              type="submit"
              disabled={updating[review.id]}
            >
              Answer
            </button>
          ) : (
            <button
              className={styles["quiz__form__button"]}
              type="button"
              onClick={onNext}
            >
              Next
            </button>
          )}

          {/* + Details 注釈リンクとアコーディオン（Nextボタンと同じ条件で表示） */}
          {(results[review.id] === true ||
            (results[review.id] === false &&
              (attempts[review.id] || 0) >= 3)) && (
            <div className={styles["quiz__details__wrapper"]}>
              <button
                className={styles["quiz__details__toggle"]}
                type="button"
                onClick={() =>
                  onSetDetailsOpen((prev) => ({
                    ...prev,
                    [review.id]: !prev[review.id],
                  }))
                }
              >
                {detailsOpen[review.id] ? "− Details" : "+ Details"}
              </button>
              <div
                className={
                  styles["quiz__details__content"] +
                  (detailsOpen[review.id]
                    ? " " + styles["quiz__details__content"] + "--open"
                    : "")
                }
              >
                {/* Main word/訳語 */}
                {review.quiz.main_word && (
                  <div className={styles["quiz__details__main-word__block"]}>
                    <span className={styles["quiz__details__main-word__text"]}>
                      {review.quiz.main_word}
                    </span>
                    {Array.isArray(review.quiz.main_word_translations) &&
                      review.quiz.main_word_translations.length > 0 && (
                        <span
                          className={
                            styles["quiz__details__main-word__translation"]
                          }
                        >
                          [
                          {review.quiz.main_word_translations.map(
                            (t: string, i: number) => (
                              <span key={i}>
                                {t}
                                {i <
                                review.quiz.main_word_translations.length - 1
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
                {/* Explanation */}
                {review.quiz.explanation && (
                  <div className={styles["quiz__details__explanation__box"]}>
                    <span
                      className={styles["quiz__details__explanation__label"]}
                    >
                      Explanation
                    </span>
                    <span
                      className={styles["quiz__details__explanation__text"]}
                    >
                      {review.quiz.explanation}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
